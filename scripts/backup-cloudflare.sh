#!/usr/bin/env bash
set -euo pipefail

# Compatibility entry point for existing local automation. The live site no
# longer uses Cloudflare D1 or R2; backups are stored in private Vercel Blob.
repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
exec "$repo_root/scripts/backup-sanity.sh" "$@"
