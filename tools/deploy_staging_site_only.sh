#!/usr/bin/env bash
set -euo pipefail

ROOT="/opt/ew2r3-preview"
SITE="$ROOT/site"
ARCHIVE="/tmp/claude-staging-site.tar.gz"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP="$ROOT/backups/$STAMP"

test -s "$ARCHIVE"
test -d "$ROOT"

resolved_root="$(readlink -f "$ROOT")"
resolved_site="$(readlink -f "$SITE")"
case "$resolved_site" in
  "$resolved_root"/site) ;;
  *) echo "Refusing unexpected site path: $resolved_site" >&2; exit 1 ;;
esac

mkdir -p "$BACKUP"
cp -a "$SITE" "$BACKUP/site.before"

find "$SITE" -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
tar -xzf "$ARCHIVE" -C "$SITE"

docker exec ew2r3-preview nginx -t

echo "BACKUP=$BACKUP"
echo "FILES=$(find "$SITE" -type f | wc -l)"
curl -fsS -o /dev/null -w 'PREVIEW_HTTP=%{http_code}\n' https://claude.rwa.bayern/ew2r3-preview/
curl -fsS -o /dev/null -w 'VERIFY_HTTP=%{http_code}\n' https://claude.rwa.bayern/ew2r3-preview/verify/
