#!/usr/bin/env bash
set -euo pipefail

# Creates a private, restorable snapshot of production D1 data and R2 media.
# Snapshots live in ./backups/ and are intentionally excluded from Git.

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
timestamp=$(date -u +"%Y-%m-%dT%H-%M-%SZ")
backup_dir="${BACKUP_DIR:-$repo_root/backups/$timestamp}"
mkdir -p "$backup_dir/r2"

cd "$repo_root"
echo "Creating D1 snapshot in $backup_dir"
npx wrangler d1 export zzgcopilot-db --remote --output "$backup_dir/zzgcopilot-db.sql" --skip-confirmation

echo "Reading the R2 media manifest from D1"
npx wrangler d1 execute zzgcopilot-db --remote \
  --command "SELECT r2_key, original_name, mime_type, size, source_url, created_at FROM media ORDER BY created_at" \
  --json > "$backup_dir/r2-manifest-raw.json"

node - "$backup_dir/r2-manifest-raw.json" "$backup_dir/r2-manifest.json" <<'NODE'
const fs = require('fs')
const [input, output] = process.argv.slice(2)
const response = JSON.parse(fs.readFileSync(input, 'utf8'))
const media = response[0]?.results || []
fs.writeFileSync(output, JSON.stringify({ generated_at: new Date().toISOString(), media }, null, 2) + '\n')
NODE
rm "$backup_dir/r2-manifest-raw.json"

media_keys=$(node - "$backup_dir/r2-manifest.json" <<'NODE'
const fs = require('fs')
const media = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')).media || []
for (const item of media) {
  if (item.source_url) continue
  const key = String(item.r2_key || '')
  if (!key || key.startsWith('/') || key.split('/').includes('..')) throw new Error(`Unsafe R2 key: ${key}`)
  console.log(key)
}
NODE
)

if [[ -n "$media_keys" ]]; then
  while IFS= read -r key; do
    destination="$backup_dir/r2/$key"
    mkdir -p "$(dirname "$destination")"
    echo "Downloading R2 object: $key"
    npx wrangler r2 object get "zzgcopilot-assets/$key" --remote --file "$destination"
  done <<< "$media_keys"
else
  echo "No R2 media objects are registered yet. Manifest saved with an empty media list."
fi

(cd "$backup_dir" && find . -type f ! -name 'SHA256SUMS' -print0 | sort -z | xargs -0 shasum -a 256 > SHA256SUMS)
archive_path="${backup_dir}.tar.gz"
tar -C "$(dirname "$backup_dir")" -czf "$archive_path" "$(basename "$backup_dir")"
restore_test_dir=$(mktemp -d)
trap 'rm -rf "$restore_test_dir"' EXIT
tar -xzf "$archive_path" -C "$restore_test_dir"
restored_snapshot="$restore_test_dir/$(basename "$backup_dir")"
(cd "$restored_snapshot" && shasum -a 256 -c SHA256SUMS)
sqlite3 "$restore_test_dir/restore-test.sqlite" < "$restored_snapshot/zzgcopilot-db.sql"
integrity_result=$(sqlite3 "$restore_test_dir/restore-test.sqlite" 'PRAGMA integrity_check;')
if [[ "$integrity_result" != "ok" ]]; then
  echo "Restore rehearsal failed: $integrity_result" >&2
  exit 1
fi
echo "Restore rehearsal passed"
echo "Uploading encrypted-in-transit archive to the private backup bucket"
npx wrangler r2 object put "zzgcopilot-backups/${timestamp}.tar.gz" --remote --file "$archive_path"
npx wrangler d1 execute zzgcopilot-db --remote \
  --command "INSERT INTO system_events (event_type, status, details) VALUES ('backup', 'success', '{\"archive\":\"${timestamp}.tar.gz\",\"restore_verified\":true}')" \
  --yes
echo "Backup complete: $backup_dir"
