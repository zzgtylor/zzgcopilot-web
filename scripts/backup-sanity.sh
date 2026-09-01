#!/usr/bin/env bash
set -euo pipefail

# Stores a restorable copy of the live Sanity documents and referenced media.
# D1 and the retired R2 asset bucket are intentionally not part of the live site.

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
timestamp=$(date -u +"%Y-%m-%dT%H-%M-%SZ")
backup_dir="${BACKUP_DIR:-$repo_root/backups/$timestamp}"

mkdir -p "$backup_dir/sanity-assets"
cd "$repo_root"

SANITY_PROJECT_ID="${SANITY_PROJECT_ID:-o9d9rhdt}" \
SANITY_DATASET="${SANITY_DATASET:-production}" \
SANITY_AUTH_TOKEN="${SANITY_AUTH_TOKEN:?SANITY_AUTH_TOKEN is required}" \
node scripts/export-sanity-content.mjs "$backup_dir/sanity-content.json"

SANITY_PROJECT_ID="${SANITY_PROJECT_ID:-o9d9rhdt}" \
SANITY_DATASET="${SANITY_DATASET:-production}" \
SANITY_AUTH_TOKEN="${SANITY_AUTH_TOKEN:?SANITY_AUTH_TOKEN is required}" \
node scripts/backup-sanity-assets.mjs "$backup_dir/sanity-assets"

node - "$backup_dir/sanity-content.json" <<'NODE'
const fs = require('fs')
const snapshot = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
if (snapshot.format !== 'zzgcopilot-sanity-backup/v2' || !Array.isArray(snapshot.documents)) throw new Error('Invalid Sanity backup snapshot')
console.log(`Validated ${snapshot.documents.length} Sanity document(s)`)
NODE

(cd "$backup_dir" && find . -type f -print0 | sort -z | xargs -0 shasum -a 256 > SHA256SUMS)
archive_path="${backup_dir}.tar.gz"
tar -C "$(dirname "$backup_dir")" -czf "$archive_path" "$(basename "$backup_dir")"

restore_test_dir=$(mktemp -d)
trap 'rm -rf "$restore_test_dir"' EXIT
tar -xzf "$archive_path" -C "$restore_test_dir"
(cd "$restore_test_dir/$(basename "$backup_dir")" && shasum -a 256 -c SHA256SUMS)

node scripts/upload-backup-to-vercel-blob.mjs "$archive_path" "backups/sanity/${timestamp}.tar.gz"
echo "Sanity backup complete and stored in private Vercel Blob: $archive_path"
