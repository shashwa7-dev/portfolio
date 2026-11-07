#!/usr/bin/env bash
# Fails if the homepage's initial JS mentions the Diwali show's heavy parts.
set -euo pipefail
html=.next/server/app/index.html
hits=0
for c in $(grep -oE '/_next/static/chunks/[^"]+\.js' "$html" | sort -u); do
  f=".next${c#/_next}"
  if grep -qE 'QirCMADtks8|iframe_api|Rozha|laddoo-plate|lakshmi-ganesh' "$f"; then echo "heavy Diwali code in initial chunk: $c"; hits=1; fi
done
exit $hits
