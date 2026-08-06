# Cloudflare D1 and R2 recovery

Production content lives in D1 (`zzgcopilot-db`) and media lives in R2 (`zzgcopilot-assets`). A usable recovery point must include both.

## Create a backup

From the project root, run:

```bash
bash scripts/backup-cloudflare.sh
```

The script exports the complete remote D1 database, reads every registered `media.r2_key`, downloads the matching R2 objects, and writes `SHA256SUMS` for integrity checking. Files are created under `backups/<UTC timestamp>/`; this directory is ignored by Git.

Before relying on a snapshot, verify it:

```bash
cd backups/<UTC timestamp>
shasum -a 256 -c SHA256SUMS
```

## Recover a snapshot

Restoring overwrites production data. First create a fresh backup, then put the saved R2 files back before importing D1:

```bash
cd backups/<UTC timestamp>
find r2 -type f -print | while IFS= read -r file; do
  key=${file#r2/}
  npx wrangler r2 object put "zzgcopilot-assets/$key" --remote --file "$file"
done

npx wrangler d1 execute zzgcopilot-db --remote --file zzgcopilot-db.sql
```

Do not run the recovery commands until you have confirmed the target snapshot and created a new current backup. The script records only media listed in D1, so keep uploads flowing through the website media API rather than placing unrelated objects directly in the bucket.
