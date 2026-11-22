# Vice Hunt: opening screen, pause menu, game type

Small change. Agreed with Shashwat in the visual companion on 2026-11-22
(mockups in `.superpowers/brainstorm/15626-1795331745/content/`, final ones
`neon-pause.html` and `chrome-v3.html`).

## Why

The opening title card "looks really bad": it plays a plain Anton slam and
starts the hunt on its own. And Esc during play ends the round outright, with
no way to carry on. The game should feel like a game: a proper title screen,
a pause menu, and type that reads as game UI rather than generic web mono.

## What

**Opening screen** (replaces `Entry`'s auto-playing card). Letterbox and
push-in stay. Over a dusk tint: "VICE" in pink neon (Monoton), "Hunt" below it
in cyan neon script (Mr Dafoe, tilted about -6deg). Under it a slanted chrome
button "CLICK TO START" (Audiowide). The hunt starts only on that click (or
Enter/Space on the focused button). Esc here goes back to the site, as today.
The neon flickers once in, then holds; under reduced motion it is steady.

**Controls notch.** Along the bottom edge, centred: the site dock's notch
shape (same two-layer rim, slanted SVG sides, colours and 54px height as
`.dock` in `app/globals.css`), holding the controls: mouse icon Shoot, `R`
keycap Reload, `ESC` keycap Pause, in Audiowide. Shown on the opening screen;
on the pause menu it shows `ESC` Resume. Not shown during play.

**Pause.** During play, Esc or right click pauses (today both end the round).
The world freezes completely: no stepping, no spawns, nothing lands, no shots,
reload and its animation hold, the hunt's sounds stop. The overlay shows
"Paused" in cyan neon script and three chrome buttons, stacked: **Resume**
(focused on open), **End round** (today's results card), **Back to site**.
Esc or Enter (on Resume) resumes. Esc while WASTED is showing does nothing new
(WASTED already freezes and hands over to results).

**WASTED** keeps its timing and greying, but the word is Monoton in red neon.

**Buttons.** Slanted (skewX -12deg, text unskewed) chrome: a two-tone fill
(light top half, darker bottom half), a hard darker bottom edge and a soft dark
drop shadow. No coloured glow and no text-shadow on buttons or controls text.
Primary (start, focused menu item): pink start, cyan menu selection. Other
menu items: dark fill, thin cyan border.

**Type.** Monoton, Mr Dafoe, Audiowide: OFL, self-hosted next to Anton in
`public/gta6/fonts/` (latin subset woff2, `@font-face` in the lazy game CSS,
OFL.txt updated), never fetched from Google at run time. The HUD (score,
hearts, ammo, chips) stays in Anton. No em-dashes in copy.

## How (decided)

- `games/vice-hunt`: the `Hunt` handle gains `pause()` and `resume()`.
  Paused: the rAF loop stops and the visibility handler does not restart it,
  pointer and key input is ignored except that Esc is left to the host, gun
  animations pause, `last` is reset on resume so no big dt. `onExit` becomes
  `onPause` (Esc or right click while playing and not paused or wasted).
- `components/gta6/game/`: `Entry` becomes the title screen with the start
  button; a new `Pause` component; a `ControlsNotch` component; GameMode keeps
  the hunt mounted while paused (a `paused` state inside "play", not a phase
  change, so the hunt is not destroyed). `/vice-hunt` and the revolver both get
  it through GameMode unchanged.

## Not doing

Changing the HUD, results card or Bigfoot banner fonts. Touch support.
Sound for the menus.

## Left to the builder

Exact flicker keyframes, focus ring style on the chrome buttons, the notch's
font sizes at small window widths.

## Addendum (2026-11-22): results card

Agreed in the companion (`results-v2.html` header B, `results-points.html`
option 1). Header: "LEONIDA WILDLIFE REPORT" eyebrow, "Hunt over" in cyan neon
script, the score in pink neon. The "RABBIT 100 · ..." rule lines are gone;
instead the card shows how the score was made, one line each: every common
animal (kills, "N each", points), the rares together (named once met), a
protected kind once hit (cows brought down and their penalty, in red), the
streak bonus, and what the zero floor kept if a penalty hit it. The lines add
up to the score. Then accuracy and best streak, then the chrome Play again and
Back to site buttons. The buttons never leave the card: it is capped at the
window height and the lines scroll inside it. A protected kind counts how
many were brought down, never its hits (one cow is 1).
