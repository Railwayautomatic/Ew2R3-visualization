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

# The repository is the production/root artifact. Staging lives under a
# subpath, so only the deployed copy receives staging URLs and path prefixes.
python3 - "$SITE" <<'PY'
from pathlib import Path
import sys

site = Path(sys.argv[1])
for path in site.rglob("*.html"):
    text = path.read_text(encoding="utf-8")
    text = text.replace("https://ew2r3.org/", "https://claude.rwa.bayern/ew2r3-preview/")
    for target in ("assets/", "verify/", "research/", "faq/", "about/", "support/", "contact/", "privacy/", "thanks/"):
        text = text.replace(f'href="/{target}', f'href="/ew2r3-preview/{target}')
        text = text.replace(f'src="/{target}', f'src="/ew2r3-preview/{target}')
    text = text.replace('href="/"', 'href="/ew2r3-preview/"')
    path.write_text(text, encoding="utf-8")
PY

docker exec ew2r3-preview nginx -t

echo "BACKUP=$BACKUP"
echo "FILES=$(find "$SITE" -type f | wc -l)"
curl -fsS -o /dev/null -w 'PREVIEW_HTTP=%{http_code}\n' https://claude.rwa.bayern/ew2r3-preview/
curl -fsS -o /dev/null -w 'VERIFY_HTTP=%{http_code}\n' https://claude.rwa.bayern/ew2r3-preview/verify/
