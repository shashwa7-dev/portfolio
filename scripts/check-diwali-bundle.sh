#!/usr/bin/env bash
# Fails if the homepage's initial JS or CSS carries the Diwali show's heavy parts.
#   (no argument)  flag on: the show (video, fonts, finale art and their
#                  styles) must stay lazy. Only the hero fuse may load up front.
#   --off          flag off: no Diwali code or styles at all may reach the
#                  homepage, not even the hero fuse.
set -euo pipefail
html=.next/server/app/index.html
pattern='QirCMADtks8|iframe_api|Rozha|laddoo-plate|lakshmi-ganesh'
# Show, finale and plate styles live in diwali.module.css; the fonts are Rozha
# One and Tiro Devanagari Hindi. The fuse's own styles are fuse.module.css.
css_pattern='diwali-module__|Rozha|Tiro'
if [ "${1:-}" = "--off" ]; then
  pattern="$pattern|chakri|fuseButton|createDiwaliSound|diwali-module__|fuse-module__"
  css_pattern="$css_pattern|fuse-module__"
fi
hits=0
for c in $(grep -oE '/_next/static/chunks/[^"]+\.js' "$html" | sort -u); do
  f=".next${c#/_next}"
  if grep -qE "$pattern" "$f"; then echo "heavy Diwali code in initial chunk: $c"; hits=1; fi
done
# Every stylesheet the homepage links, whatever the attribute order.
for c in $(grep -oE '<link[^>]*rel="stylesheet"[^>]*>' "$html" | grep -oE '/_next/static/[^"]+\.css' | sort -u); do
  f=".next${c#/_next}"
  if grep -qE "$css_pattern" "$f"; then echo "Diwali styles in homepage stylesheet: $c"; hits=1; fi
done
exit $hits
