#!/usr/bin/env bash
# Fails if the homepage's initial JS mentions the Diwali show's heavy parts.
#   (no argument)  flag on: the show (video, fonts, finale art) must stay lazy.
#   --off          flag off: no Diwali code at all may be in the initial JS,
#                  not even the hero fuse.
set -euo pipefail
html=.next/server/app/index.html
pattern='QirCMADtks8|iframe_api|Rozha|laddoo-plate|lakshmi-ganesh'
if [ "${1:-}" = "--off" ]; then
  pattern="$pattern|chakri|fuseButton|createDiwaliSound|diwali-module__"
fi
hits=0
for c in $(grep -oE '/_next/static/chunks/[^"]+\.js' "$html" | sort -u); do
  f=".next${c#/_next}"
  if grep -qE "$pattern" "$f"; then echo "heavy Diwali code in initial chunk: $c"; hits=1; fi
done
exit $hits
