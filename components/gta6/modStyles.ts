/**
 * The GTA 6 mode's stylesheet, rendered by `GtaMode` as a `<style>` so it
 * reaches the visitor only when the mode turns on. A CSS module cannot hold
 * the bare `html[data-mod]` selectors the token overrides need, and
 * `globals.css` would ship it to everyone up front.
 *
 * Colours: only the accent family changes (pink, from the spec), plus an aqua
 * for the "Open to work" live ink that is amber the rest of the time. The
 * page's paper, borders and text tokens stay as they are, so every page
 * element keeps its contrast.
 *
 * The backdrop rules are not scoped to `data-mod`: the attribute goes the
 * moment the mode turns off, and the art still has its fade out to play.
 *
 * The fade is one transition, in and out, with no keyframes: turning the
 * mode back on mid fade out reverses from wherever the opacity has got to,
 * and leaving mid fade in does the same. The fade in on mount comes from
 * `@starting-style` (a browser without it shows the art at once).
 *
 * Wallpapers: thirteen on one cycle (`--duration-gta-wall-cycle`, 65 s), each up
 * for one turn (`--duration-gta-wall-turn`, 5 s) and staggered a turn apart,
 * fading over the first and last second of its turn, so each fade out is the
 * next one's fade in. The keyframe stops assume those two values (1 s of
 * 65 s is 1.538%); change them together. Under reduced motion only the first
 * shows.
 */
export const MOD_CSS = `
html[data-mod="gta6"] {
  --accent: 337 52% 55%;
  --accent-hover: 337 47% 47%;
  --accent-foreground: 0 0% 100%;
  --ring: 337 52% 55%;
  --gta-live: 184 53% 38%;
}
html.dark[data-mod="gta6"] {
  --accent: 357 80% 79%;
  --accent-hover: 356 80% 84%;
  --accent-foreground: 251 26% 12%;
  --ring: 357 80% 79%;
  --gta-live: 175 51% 67%;
}
html[data-mod="gta6"] .hero-name { color: hsl(var(--accent)); }
html[data-mod="gta6"] .hero-live { color: hsl(var(--gta-live)); }
html[data-mod="gta6"] .hero-live-dot { background-color: hsl(var(--gta-live)); }
html[data-mod="gta6"] .starter-pack-hang { display: none; }

.gta-fade { transition: opacity var(--duration-gta-fade) var(--ease-out); }
@starting-style { .gta-fade { opacity: 0; } }
.gta-fade[data-leaving] { opacity: 0; }

.gta-wall {
  opacity: 0;
  animation: gta-wall var(--duration-gta-wall-cycle) linear infinite;
  animation-delay: calc(var(--i) * var(--duration-gta-wall-turn));
}
@keyframes gta-wall {
  0% { opacity: 0; }
  1.538% { opacity: 1; }
  7.692% { opacity: 1; }
  9.231% { opacity: 0; }
  100% { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .gta-wall { animation: none; }
  .gta-wall:first-child { opacity: 1; }
}

.gta-veil { background: hsl(var(--background) / 0.82); }
@media (min-width: 768px) {
  .gta-veil {
    background: linear-gradient(90deg, hsl(var(--background) / 0.86) 0%, hsl(var(--background) / 0.7) 45%, hsl(var(--background) / 0.2) 100%);
    -webkit-backdrop-filter: blur(1.5px);
    backdrop-filter: blur(1.5px);
  }
}
`;
