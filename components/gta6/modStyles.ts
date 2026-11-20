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
 * Wallpapers: seven on one 35 s cycle, each up for 5 s and staggered 5 s
 * apart, fading over the first and last second of its turn, so each fade out
 * is the next one's fade in. Under reduced motion only the first shows.
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

.gta-fade { animation: gta-in var(--duration-gta-fade) var(--ease-out); }
.gta-fade[data-leaving] {
  opacity: 0;
  transition: opacity var(--duration-gta-fade) var(--ease-out);
}
@keyframes gta-in { from { opacity: 0; } }

.gta-wall {
  --gta-wall-cycle: 35s;
  --gta-wall-turn: 5s;
  opacity: 0;
  animation: gta-wall var(--gta-wall-cycle) linear infinite;
  animation-delay: calc(var(--i) * var(--gta-wall-turn));
}
@keyframes gta-wall {
  0% { opacity: 0; }
  2.857% { opacity: 1; }
  14.286% { opacity: 1; }
  17.143% { opacity: 0; }
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
