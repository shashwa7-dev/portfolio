#!/usr/bin/env bash
# Fails if the starter pack card reaches the homepage's initial JS or CSS.
# The card is loaded after the page is idle (components/starter-pack/
# StarterPackMount.tsx); none of it may be in the first load. Run after
# `npm run build`.
set -euo pipefail
html=.next/server/app/index.html
# Copy and names that only exist inside the card's own chunk.
pattern='SHIPS IN SPRINTS|stepLanyard|frameGravity|playBloop|start_radio'
css_pattern='StarterPack-module__|sp-marker|sp-label|Sedgwick'
hits=0
for c in $(grep -oE '/_next/static/chunks/[^"]+\.js' "$html" | sort -u); do
  f=".next${c#/_next}"
  if grep -qE "$pattern" "$f"; then echo "starter pack code in initial chunk: $c"; hits=1; fi
done
for c in $(grep -oE '<link[^>]*rel="stylesheet"[^>]*>' "$html" | grep -oE '/_next/static/[^"]+\.css' | sort -u); do
  f=".next${c#/_next}"
  if grep -qE "$css_pattern" "$f"; then echo "starter pack styles in homepage stylesheet: $c"; hits=1; fi
done
[ $hits -eq 0 ] && echo "starter pack: nothing in the homepage's first load"
exit $hits
