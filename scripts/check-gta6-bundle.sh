#!/usr/bin/env bash
# Fails if the homepage's initial JS or CSS carries the GTA 6 mode or Vice Hunt.
#   (no argument)  flags on: the mode, its music id, wallpapers, the game and
#                  the mod styles must stay lazy.
#   --off          flags off: no GTA 6 code or markup at all may reach the
#                  homepage.
# A chunk or stylesheet the HTML references but that is missing on disk counts
# as a failure, so a broken build cannot pass silently.
set -euo pipefail
html=.next/server/app/index.html
pattern='aonTwBM1AZM|/gta6/wallpapers|startHunt|preloadHunt|vice-hunt'
css_pattern='data-mod="gta6"|data-mod=gta6'
if [ "${1:-}" = "--off" ]; then
  pattern="$pattern|Vice City mode|hero-live-dot|data-gta-cluster"
fi
hits=0
chunks=$(grep -oE '/_next/static/chunks/[^"]+\.js' "$html" | sort -u || true)
if [ -z "$chunks" ]; then echo "no initial chunks found in $html"; hits=1; fi
for c in $chunks; do
  f=".next${c#/_next}"
  if [ ! -f "$f" ]; then echo "referenced chunk missing: $c"; hits=1; continue; fi
  if grep -qE "$pattern" "$f"; then echo "GTA 6 code in initial chunk: $c"; hits=1; fi
done
# Every stylesheet the homepage links, whatever the attribute order.
for c in $(grep -oE '<link[^>]*rel="stylesheet"[^>]*>' "$html" | grep -oE '/_next/static/[^"]+\.css' | sort -u); do
  f=".next${c#/_next}"
  if [ ! -f "$f" ]; then echo "referenced stylesheet missing: $c"; hits=1; continue; fi
  if grep -qE "$css_pattern" "$f"; then echo "GTA 6 styles in homepage stylesheet: $c"; hits=1; fi
done
# The off build must not carry the mode's own markup in the HTML either (the
# hero live dot is plain hero markup, so it is only checked in the chunks).
if [ "${1:-}" = "--off" ] && grep -qE 'Vice City mode|data-gta-cluster|data-mod="gta6"' "$html"; then
  echo "GTA 6 markup in homepage HTML"; hits=1
fi
exit $hits
