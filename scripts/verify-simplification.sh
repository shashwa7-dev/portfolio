#!/usr/bin/env bash
# Mechanical invariants for the portfolio simplification.
# Spec: docs/superpowers/specs/2026-08-11-portfolio-simplification-design.md
# Usage: ./scripts/verify-simplification.sh
# Exit 0 = all checks pass.

set -uo pipefail
cd "$(dirname "$0")/.."

# Preflight. Without this, running from the wrong directory makes every
# count check find zero matches and report PASS. A gate that goes green
# when it cannot find the source tree is worse than no gate at all.
for required in package.json app components lib tailwind.config.ts; do
  if [ ! -e "$required" ]; then
    printf '\033[31mABORT\033[0m  not at the repo root: %s is missing (cwd: %s)\n' \
      "$required" "$(pwd)" >&2
    exit 2
  fi
done

FAILED=0

# count <label> <expected-count> <grep-args...>
count() {
  local id="$1" label="$2" want="$3"; shift 3
  local got
  got=$("$@" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$got" = "$want" ]; then
    printf '  \033[32mPASS\033[0m  %s  %s\n' "$id" "$label"
  else
    printf '  \033[31mFAIL\033[0m  %s  %s (expected %s, got %s)\n' "$id" "$label" "$want" "$got"
    FAILED=1
  fi
}

# absent <id> <label> <path>
absent() {
  local id="$1" label="$2" path="$3"
  if [ ! -e "$path" ]; then
    printf '  \033[32mPASS\033[0m  %s  %s\n' "$id" "$label"
  else
    printf '  \033[31mFAIL\033[0m  %s  %s (%s still exists)\n' "$id" "$label" "$path"
    FAILED=1
  fi
}

SRC=(app components lib)

echo ""
echo "Typography"
count C01 "no arbitrary text-[Npx]"      0 grep -rEoh "text-\[[0-9.]+px\]" --include=*.tsx app components
count C02 "no arbitrary tracking-[Nem]"  0 grep -rEoh "tracking-\[[0-9.]+em\]" --include=*.tsx app components
count C03 "no font-serif"                0 grep -rEoh "font-serif" --include=*.tsx --include=*.ts app components lib
count C04 "no Inter/Fraunces/JetBrains"  0 grep -rEoh "Fraunces|font-inter|JetBrains_Mono" --include=*.ts --include=*.tsx app lib tailwind.config.ts

echo ""
echo "Motion"
count C05 "no transition-all"            0 grep -rEoh "transition-all" --include=*.tsx --include=*.css app components
count C06 "no tw-animate keyframes"      0 grep -rEoh "animate-in|animate-out|fade-in-0|zoom-in-95" --include=*.tsx app components
count C07 "single TooltipProvider"       1 grep -rEl "<TooltipProvider" --include=*.tsx app components
count C08 "no whileInView"               0 grep -rEoh "whileInView" --include=*.tsx app components
count C09 "orphaned motion tokens gone"  0 grep -rEoh "ease\.expo|ease\.modal|spring\.soft|spring\.pop|duration\.ambient|duration\.draw|wordCycle|stagger\.section" --include=*.ts --include=*.tsx app components lib

echo ""
echo "Deleted surfaces"
absent C10 "/motion route gone"          app/motion
absent C10 "/motion components gone"     components/motion
absent C11 "/design route gone"          app/design
absent C11 "/skills route gone"          app/skills
absent C11 "skillsData gone"             lib/skillsData.ts
absent C12 "transitions-dev skill gone"  .claude/skills/transitions-dev
count C13 "no dead component imports"    0 grep -rEoh "components/(Marquee|CurrentState|NFT|AvatarWithThemeSwitch|WorkListItem|BottomFadeMask|CurrentTime|AnimatedBackground|HeroTitle)|layout/(Divider|Reveal)|common/Accordion|common/Marquee|ui/CardNav" --include=*.tsx --include=*.ts app components lib
absent C13 "CardNav gone"                components/ui/CardNav

echo ""
echo "Palette"
count C14 "no indigo hue in tokens"      0 grep -rEoh "24[12] [0-9]+%|--accent: *24" app/globals.css

echo ""
if [ "$FAILED" = 0 ]; then
  printf '\033[32mAll checks pass.\033[0m\n\n'
else
  printf '\033[31mSome checks failed.\033[0m\n\n'
fi
exit "$FAILED"
