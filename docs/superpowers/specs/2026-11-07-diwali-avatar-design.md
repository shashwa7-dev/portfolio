# Diwali avatar: design spec

Date: 2026-11-07
Status: design agreed in a visual brainstorm, awaiting implementation plan
Prototypes (throwaway, the source of truth for look and timing):
- `docs/superpowers/specs/2026-11-07-diwali-avatar/flow-prototype.html`: the whole flow, from fuse to laddoo. It was built for the brainstorm preview server, so its image paths (`/files/...`) do not resolve on their own; read it as code.
- `docs/superpowers/specs/2026-11-07-diwali-avatar/finale-screens-prototype.html`: the final शुभ दीपावली screen at desktop, phone and tablet sizes. **Where the two disagree, this one wins for the finale** (it is later: arch removed, text trimmed, new CTA, responsive).

## 1. Summary

For Diwali, the hero photo becomes a firecracker. A fuse rings the photo; hovering shows a matchstick; clicking lights it. The page goes dark, the photo flips into a chakri, flies to the centre, and spins with sparks while The Office's "Diwali Song" plays full-screen behind it. After 5 seconds the chakri moves to the bottom-right corner and keeps spinning until the song reaches 1:07. Then a traditional शुभ दीपावली screen with Lakshmi and Ganesh, fireworks, toran, rangoli and diyas. To leave, the visitor takes prasad: a thali of laddoos comes up, they pick one, it gets two bites taken out of it, and the page comes back.

It is seasonal. One boolean turns all of it on or off, and off means the hero is exactly what ships today.

## 2. Why

Shashwat wants the portfolio to celebrate Diwali in a way that is playful (the site already has a fidget-spinner photo with a hidden music video) and also respectful and traditional at the end. The finale is a greeting to every visitor, so it should feel like a proper Diwali card, not like app UI.

## 3. Goals, non-goals, anti-goals

Goals
- A single flag, `DIWALI_ENABLED`, switches the whole feature. Flip it on before Diwali, off after.
- With the flag off, nothing of this ships to the visitor: no code in the homepage bundle, no fonts, no images.
- With the flag on, nothing heavy loads until the fuse is lit (video, idol image, Devanagari fonts, overlay code).
- Works on phones (tap, no hover) and is laid out for 360px to desktop.

Non-goals
- No date-based automatic switching. Shashwat flips the flag by hand.
- No other festivals or a general "festive theme" system. Name things for Diwali.
- No changes to any page other than the homepage hero.

Anti-goals (would make it a failure even if it technically works)
- The finale looking like generic app UI: monospace hints, system fonts, flat black. It must read as a traditional Diwali card.
- Anything that disrespects the idols: they are never blurred, cropped, covered by crumbs or confetti in a way that looks careless, or used as a click target.
- Trapping the visitor: there is always a visible way forward (Skip during the show, the prasad button at the end) and Esc works throughout.
- Loading the video or the 2.7 MB idol PNG on page load.

## 4. Decided by Shashwat

| Topic | Decision |
|---|---|
| Trigger | A fuse around the photo. Hover shows a matchstick (cursor). Click lights it. |
| Chakri look | A drawn chakri modelled on his reference: striped red/blue/white paper rim, gold band, purple disc, dotted gold ring, gold sun with ripples, gold centre. Not his photo. The photo flips like a coin into the chakri. |
| Sparks | Like a real ground chakri: a jet from one point on the rim, whipping round. |
| Lights out | Whole screen goes black; only the chakri is seen. |
| Video | YouTube `QirCMADtks8` (The Office, "The Diwali Song"), full-screen behind the chakri, with sound, starts as soon as it loads, plays from 0:00 to **1:07** then stops. |
| Chakri timing | Flies to centre and grows; holds the centre **5 seconds** after arriving; then glides to the bottom-right corner and keeps spinning until the video ends. |
| Skip | **One** button, bottom-left, very obvious (solid marigold pill, "Skip" with an icon and an `Esc` hint, pulses three times on appearing). Skip goes to the **finale**, not back to the page. Esc does the same. |
| Toran | Marigold swags and mango leaves across the top. It drops in when the lights go out and hangs over the video as well as the finale. Its top string is never visible (tucked above the screen edge). |
| Finale | The screens prototype: kumkum-red wash over the dark, gold border with paisley corner motifs, Lakshmi and Ganesh (his image) with a breathing gold glow, शुभ दीपावली in gold, lotus divider, one-line Hindi blessing, one English line, signature, the prasad button, rangoli with diyas, falling marigold and rose petals, fireworks behind. |
| Mandir arch | Removed. |
| Rangoli vs diyas | Rangoli in muted earthy colours so the diyas are clearly visible on it; diyas glow brightly. |
| Fireworks | Random sizes: some huge (spread across much of the screen), some medium, some small and distant. |
| Sound | Match strike, fuse hiss, rocket whistles, booms sized to the burst, crackle, a pop when a laddoo is picked, a crunch per bite. |
| Prasad CTA | Very clickable and visible: solid gold button, maroon text, laddoo icon, arrow, periodic shine, pulsing ring, at least 52px tall. Hint below: "Take a laddoo before you go". |
| Laddoo artwork | Three images from Shashwat replace the CSS-drawn thali and laddoos, all transparent PNGs in `~/Downloads/`: the thali, `Golden Laddus on an Ornate Plate.png` (1536×1024, baked soft halo); a whole laddoo, `Textured Orange Indian Laddu with Pistachio.png` (1293×1217); and the same laddoo with a bite out of it, `Bite-Taken Saffron Pistachio Laddu.png` (1293×1216). The two laddoo images share a canvas and line up to within a few pixels. An earlier single-laddoo image carried Vecteezy watermarks and is **not** used. |
| Leaving | A thali of laddoos rises; the visitor must pick one. The whole-laddoo image floats up from that spot and grows, then one bite: it swaps to the bitten image with a squash, a crunch and falling crumbs; "वाह!" appears, then the overlay fades and the chakri flips back into the photo as it flies home. |
| Responsive | Must work on mobile; the screens prototype shows 360×740, 390×844, 768×1024 and 1280×800. |
| Switch | A boolean in code to enable/disable the whole thing. |
| Scope and release | Full build in one pass (no staged release). It merges with `DIWALI_ENABLED = true`. |
| Video blocked on phones | Leave it as is. If a browser (iOS Safari in particular) refuses to start the video with sound, there is no muted fallback and no "tap for sound" control: the chakri runs its centre hold and corner move over the dark screen, and Skip is the way forward. |

## 5. The flow, step by step

States: `idle → lit (fuse burning) → show:centre → show:corner → finale → plate → picked → returning → idle`.

1. **Idle (flag on).** A fuse cord rings the photo with a short tail at the bottom right. On hover devices the cursor over the photo becomes a matchstick (`cursor: none` plus a drawn match following the pointer). On touch, the fuse alone is the invitation.
2. **Lit.** Click/tap/Enter lights it: match strike + fuse hiss; a spark runs up the tail and once around the ring (about 1.4s). The video starts loading at this moment. The idol image and the overlay code are also requested now (or earlier, see 8).
3. **Lights out.** A full-screen black overlay fades in (0.8s). The toran drops in with a small bounce. The photo lifts out of the headline into a fixed-position copy, flips to the chakri face, and travels to the centre while growing to about 36% of the shorter screen side (1.1s). It starts spinning during the flight.
4. **Centre.** Full-speed spin and spark jet. The video fades in behind, filling the screen like a background (16:9, cropped to cover), when it actually starts playing. 5 seconds after arriving, the chakri glides to the bottom-right corner, shrinks to about 15% of the shorter side, and keeps spinning with fewer, shorter sparks.
5. **Video end.** At 1:07 (or Skip, or Esc), the video pauses and fades, the chakri fades, and the finale appears.
6. **Finale.** Entrance sequence in this order: idols, title, divider, blessing, button (about 2.4s total), with fireworks, petals, toran and diyas already going. The diyas light one after another.
7. **Plate.** Pressing **प्रसाद लीजिए** dims and blurs the text (not the idols: they only dim to about half) and raises the thali with "प्रसाद ग्रहण कीजिए / Take a laddoo before you go". Clicks elsewhere do nothing. Laddoos are buttons; focus moves to the first one.
8. **Picked.** The whole-laddoo image appears exactly over the picked laddoo and floats up to the centre while growing; the plate fades to about a third. Then the bite: it swaps to the bitten image with a quick squash, a crunch and crumbs. Then "वाह! Happy Diwali. Enjoy the rest of it." About 3s in total. One bite, not two (there is one bitten image).
9. **Returning.** Fireworks stop, toran lifts away, overlay fades, the chakri flips back into the photo and flies to the hero. Back to idle; the fuse is restored so it can be lit again.

Esc: during the show it does what Skip does (to the finale); during the finale it opens the plate. There is no way to leave from the finale except through a laddoo; that is the point, and the button is always visible.

## 6. Copy

No em-dashes anywhere (repo rule).

- Finale title: **शुभ दीपावली**
- Blessing: **माँ लक्ष्मी और श्री गणेश की कृपा से आपका घर सुख, समृद्धि और प्रकाश से भरा रहे।**
- English line: *Wishing you and your family a very happy Diwali.*
- Signature: **शाश्वत**
- CTA: **प्रसाद लीजिए**, hint *Take a laddoo before you go*
- Plate heading: **प्रसाद ग्रहण कीजिए**, sub *Take a laddoo before you go*
- After the bites: **वाह!**, sub *Happy Diwali. Enjoy the rest of it.*
- Skip button: "Skip" with a forward icon and `Esc` key hint.
- Hero tooltip while enabled: "Open to work · Click to light the chakri" (replaces the "Press F to spin" hint).

## 7. How it fits the existing hero (builder's defaults, marked as Claude's calls)

These were not discussed; they are the calls made when writing this up.

- **Flag location:** `lib/diwali.ts` exports `DIWALI_ENABLED` (a `const` boolean, like `CANDY_ENABLED` in `lib/theme.ts`), with a comment saying what it switches. Add a verify-script check that it exists. CLAUDE.md gets a short bullet describing the feature and the flag.
- **While enabled, the Diwali fuse replaces the fidget spinner, the goggles and the dotted status ring** on the hero photo. A click cannot both spin and light. The F-key spin is off while enabled. The amber live dot and "Open to work" text stay. When the flag is off, `SpinAvatar`, `AvatarHover` and the goggles are untouched and behave exactly as today.
- **Bundle split:** the hero renders a small client component for the fuse and matchstick. The overlay (show, fireworks, finale, plate, sounds) is a separate module loaded with a dynamic import, requested on hover/focus of the photo (cheap warm-up) and at the latest on light. With the flag `false`, the import is unreachable and must not appear in the homepage bundle.
- **Overlay mounting:** a portal to `document.body`, above the dock (the dock uses z-index up to 56; the overlay sits well above). Page scroll is locked while the overlay is up. The overlay is a `role="dialog"` with `aria-modal`, labelled "Diwali celebration"; focus goes to Skip during the show, to the prasad button in the finale, and back to the photo button on return.
- **Video:** YouTube IFrame API, privacy-enhanced host (`youtube-nocookie.com`), `start=0&end=67`, no controls, not clickable, `playsinline`. Also poll `getCurrentTime() >= 67` as a backup for the end. Started inside the light click so autoplay with sound is allowed. Iframe built with `referrerpolicy="strict-origin-when-cross-origin"` (YouTube rejects embeds without a referrer). If the player errors or never starts, the chakri still does its 5s centre hold and corner move; Skip remains the way forward. No automatic jump.
- **Sound:** synthesised with Web Audio, no files, through one master gain and a compressor, as in the prototype. Created on the light click. No mute control (the song already carries sound; Skip ends it).
- **Idol image:** `public/images/diwali/lakshmi-ganesh.webp`, converted from Shashwat's PNG (`~/Downloads/Lakshmi and Ganesha Ivory Statues.png`, 1536×1024 RGBA with a baked soft halo) keeping alpha, target well under 300 KB. Alt text "Lakshmi and Ganesh". Shown with `next/image` or a plain `img`; the builder picks, but it must not load before the fuse is lit or warmed up.
- **Laddoo plate from the photo:** the thali image is the plate (`public/images/diwali/laddoo-plate.webp`), and the two laddoo images become `laddoo.webp` and `laddoo-bitten.webp` in the same folder, all converted with alpha kept, each well under 200 KB. Each laddoo on the plate is a round `button` positioned in percent over the photo, one per laddoo that shows enough of itself to aim at (about nine; the builder measures centres and radii from the image). Hover/focus: a soft gold ring around that laddoo. On pick, `laddoo.webp` is placed over the picked spot at that laddoo's size, then floats up and grows; at the bite it is swapped for `laddoo-bitten.webp` (both preloaded when the plate opens, so the swap never flickers). The plate fades to about a third behind it, so the original on the plate does not compete.
- **Fonts:** Rozha One (title, signature, button) and Tiro Devanagari Hindi (blessing, hints), both via `next/font/google` declared inside the overlay module so they only load with it. Subsets `devanagari` and `latin`. Do not use `font-serif` (verify C03); use the font variables.
- **Reduced motion:** no spin, no spark jet, no fireworks, no petals, no flicker, no shine or pulse. The flow keeps its structure: the photo flips to the chakri (crossfade instead of a 3D flip), sits still in the centre over the video, moves to the corner without a glide, and the finale appears with fades only. Diyas are lit from the start. The bites still happen (they are the point) but without the float or crumbs.
- **Motion tokens:** the overlay's durations (fuse burn, blackout fade, flight, centre hold, corner glide, finale stagger, bite timing, return) go into `lib/motionVariants.ts` and are mirrored as CSS custom properties in `app/globals.css`, per repo rule. Physics constants for sparks, fireworks and the spin are not durations and can live in the module, as in `SpinAvatar`.
- **Tests:** keep the state machine (section 5) as a pure reducer in `lib/diwali/` with vitest coverage of its transitions, including Esc and Skip from each state and that `picked` cannot be re-entered. The fireworks burst sizing can be a pure function with a test of its tier distribution. Drawing code is not unit-tested.
- **Branch:** a new branch `diwali-avatar` cut from `chapter-dock` (not `master`), because the overlay must sit above, and hand focus around, the dock as it is on `chapter-dock`. It merges after `chapter-dock` does.
- **Agent memory:** not a fact about Shashwat; `data/agent-memory.md` is not updated.

## 8. Left to the builder

- File and component names under `components/diwali/` and `lib/diwali/`.
- Canvas vs SVG/DOM for each effect (the prototype uses canvas for sparks and fireworks, SVG for chakri, toran, diyas, rangoli, corners, and CSS for the laddoo).
- Exact sizes, spacing, glow strengths and spark counts, matching the prototypes.
- How the photo copy is made for the flight (clone vs FLIP of the real node).
- Whether to warm up the overlay module on hover/focus as well as on light.

## 9. Constraints from the repo

- Next.js 16 App Router, React 19, Tailwind 4. Read `node_modules/next/dist/docs/` before writing Next-specific code.
- `scripts/verify-simplification.sh` must exit 0; `npm run build`, `npm run lint`, `npm test` must pass.
- No arbitrary `text-[Npx]`, no `transition-all`, no `font-serif`, icons only from `@phosphor-icons/react/ssr` or `simple-icons`.
- Shashwat checks visuals himself; no browser verification step is needed in the plan.
