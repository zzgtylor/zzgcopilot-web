#!/usr/bin/env bash
set -euo pipefail

# Creates an independently restorable PostgreSQL snapshot for Neon.
# The database is never exposed to the browser; only the archive is sent to
# private Vercel Blob or retained as a GitLab artifact.
repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
timestamp=$(date -u +"%Y-%m-%dT%H-%M-%SZ")
backup_dir="${BACKUP_DIR:-$repo_root/backups/$timestamp-neon}"
database_url="${DATABASE_URL:-${POSTGRES_URL:-${NEON_DATABASE_URL:-}}}"

command -v pg_dump >/dev/null 2>&1 || { echo 'pg_dump is required for Neon backups' >&2; exit 1; }
[[ -n "$database_url" ]] || { echo 'DATABASE_URL, POSTGRES_URL, or NEON_DATABASE_URL is required' >&2; exit 1; }

mkdir -p "$backup_dir"
dump_path="$backup_dir/neon-${timestamp}.dump"
pg_dump --no-owner --no-privileges --format=custom --file="$dump_path" "$database_url"
test -s "$dump_path"
pg_restore --list "$dump_path" >/dev/null || { echo 'Neon dump archive is not readable' >&2; exit 1; }
(cd "$backup_dir" && shasum -a 256 "$(basename "$dump_path")" > SHA256SUMS)
archive_path="${backup_dir}.tar.gz"
tar -C "$(dirname "$backup_dir")" -czf "$archive_path" "$(basename "$backup_dir")"

restore_test_dir=$(mktemp -d)
trap 'rm -rf "$restore_test_dir"' EXIT
tar -xzf "$archive_path" -C "$restore_test_dir"
(cd "$restore_test_dir/$(basename "$backup_dir")" && shasum -a 256 -c SHA256SUMS)

if [[ -n "${RESTORE_DATABASE_URL:-}" ]]; then
  echo 'Running isolated restore rehearsal against RESTORE_DATABASE_URL'
  pg_restore --clean --if-exists --no-owner --no-privileges --dbname="$RESTORE_DATABASE_URL" "$dump_path"
  echo 'Restore rehearsal passed'
else
  echo 'Structural restore rehearsal passed; set RESTORE_DATABASE_URL for a live isolated restore rehearsal.'
fi

if [[ "${BACKUP_STORAGE:-vercel-blob}" == "gitlab-artifact" ]]; then
  echo "Neon backup complete and ready for GitLab artifact retention: $archive_path"
else
  node scripts/upload-backup-to-vercel-blob.mjs "$archive_path" "backups/neon/${timestamp}.tar.gz"
  echo "Neon backup complete and stored in private Vercel Blob: $archive_path"
fi
