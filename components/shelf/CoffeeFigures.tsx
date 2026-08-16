/**
 * Diagrams for the coffee page, drawn rather than photographed.
 *
 * A photograph cannot show why a wider basket makes a shallower bed, or what
 * channeling looks like inside a puck, and every openly licensed coffee image
 * turns out to be a photograph. These are inline SVG so they need no licence,
 * carry no attribution, inherit the theme through `currentColor`, and stay
 * sharp at any size. All four together are a few KB.
 */

function Figure({
  caption,
  children,
  label,
  height,
  width = 620,
}: {
  caption: string;
  label: string;
  /** Content height in viewBox units. Every diagram used to pad out to a
   *  shared 250, which left a visible gap under the shorter ones. */
  height: number;
  /** Widen past the default when a row of text would otherwise run past the
   *  right edge. An SVG root clips to its viewport, so the overrun is not
   *  visible as overflow, it simply shears the last word off. */
  width?: number;
  children: React.ReactNode;
}) {
  return (
    <figure className="my-6 rounded-2xl border border-border bg-card p-5 md:p-6">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={label}
        className="block h-auto w-full text-foreground"
      >
        {children}
      </svg>
      <figcaption className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}

const LABEL =
  "font-mono text-2xs uppercase tracking-label fill-subtle";
const TEXT = "text-xs fill-muted-foreground";
const STRONG = "text-sm font-semibold fill-foreground";

/** Even against uneven grind: why channeling ruins a shot. */
export function GrindEvennessFigure() {
  const coarse = [
    [28, 60, 13], [72, 52, 9], [112, 66, 15], [205, 58, 12], [243, 70, 10],
    [168, 50, 7], [40, 100, 11], [90, 110, 14], [230, 108, 13], [196, 120, 9],
    [60, 132, 8], [120, 128, 10], [250, 135, 11], [20, 128, 6],
  ];
  const fines = [
    [52, 76], [96, 86], [132, 96], [220, 88], [182, 98], [76, 120],
    [212, 140], [106, 142], [36, 112], [240, 46], [150, 118], [66, 46],
  ];
  const even = [] as [number, number][];
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 9; col++)
      even.push([352 + col * 29, 52 + row * 34 + (col % 2 ? 4 : 0)]);

  return (
    <Figure
      height={244}
      label="Two coffee beds compared. Uneven grounds let water carve a channel through one spot. Even grounds let water pass through the whole bed."
      caption="The same dose, the same machine, the same water. The only difference is how evenly the beans were broken up."
    >
      <text x="0" y="12" className={LABEL}>Uneven grind</text>
      <text x="330" y="12" className={LABEL}>Even grind</text>

      <rect x="0" y="30" width="270" height="120" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <g fill="currentColor" opacity="0.5">
        {coarse.map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} />)}
      </g>
      <g fill="currentColor" opacity="0.75">
        {fines.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={2.2} />)}
      </g>
      <path d="M155 22 L155 158" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="M145 148 L155 162 L165 148" fill="none" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
      <text x="0" y="184" className={STRONG}>Water finds the gap</text>
      <text x="0" y="204" className={TEXT}>It rushes through one path and barely</text>
      <text x="0" y="221" className={TEXT}>touches the rest of the bed. Sour and</text>
      <text x="0" y="238" className={TEXT}>bitter in the same cup.</text>

      <rect x="330" y="30" width="270" height="120" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <g fill="currentColor" opacity="0.5">
        {even.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={8} />)}
      </g>
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        {[352, 382, 412, 442, 472, 502, 532, 562, 586].map((x) => (
          <path key={x} d={`M${x} 22 L${x} 158`} />
        ))}
      </g>
      <text x="330" y="184" className={STRONG}>Water spreads out</text>
      <text x="330" y="204" className={TEXT}>Every particle gives up roughly the</text>
      <text x="330" y="221" className={TEXT}>same amount at the same time. The</text>
      <text x="330" y="238" className={TEXT}>cup tastes like one thing.</text>
    </Figure>
  );
}

/** Grind size against contact time, particles drawn to relative scale. */
export function GrindSizeFigure() {
  const espresso = [] as [number, number][];
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 7; c++) espresso.push([20 + c * 22, 40 + r * 27 + (c % 2 ? 6 : 0)]);
  const medium = [] as [number, number][];
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 5; c++) medium.push([245 + c * 35, 45 + r * 29 + (c % 2 ? 7 : 0)]);
  const coarse: [number, number][] = [
    [470, 50], [520, 45], [572, 52], [472, 90], [522, 95], [574, 88],
  ];

  const cols = [
    { x: 0, label: "Espresso", size: "200 to 400 microns", like: "Fine. Like table salt.",
      time: "25 to 30 seconds", why: ["Under pressure, so it needs the", "resistance a fine bed provides."] },
    { x: 220, label: "Pour over", size: "400 to 800 microns", like: "Medium. Like coarse sand.",
      time: "2 to 3 and a half minutes", why: ["Gravity only, so the water needs", "room to drain through."] },
    { x: 440, label: "French press", size: "750 to 1000 microns", like: "Coarse. Like sea salt.",
      time: "4 minutes", why: ["Sitting in water the whole time,", "so the pieces extract slowly."] },
  ];

  return (
    <Figure
      height={244}
      label="Grind size compared across espresso, pour over and French press, with particle size drawn to relative scale."
      caption="Particles drawn to roughly their real relative size. Short contact needs small pieces to get enough out in time. Long contact needs large ones so it does not pull out too much."
    >
      {cols.map((c) => (
        <g key={c.label}>
          <text x={c.x} y="12" className={LABEL}>{c.label}</text>
          <rect x={c.x} y="24" width="180" height="94" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <text x={c.x} y="138" className={STRONG}>{c.size}</text>
          <text x={c.x} y="156" className={TEXT}>{c.like}</text>
          <text x={c.x} y="182" className={LABEL}>Contact</text>
          <text x={c.x} y="200" className={STRONG}>{c.time}</text>
          <text x={c.x} y="222" className={TEXT}>{c.why[0]}</text>
          <text x={c.x} y="238" className={TEXT}>{c.why[1]}</text>
        </g>
      ))}
      <g fill="currentColor" opacity="0.55">
        {espresso.map(([cx, cy], i) => <circle key={`e${i}`} cx={cx} cy={cy} r={3} />)}
        {medium.map(([cx, cy], i) => <circle key={`m${i}`} cx={cx} cy={cy} r={7} />)}
        {coarse.map(([cx, cy], i) => <circle key={`c${i}`} cx={cx} cy={cy} r={13} />)}
      </g>
    </Figure>
  );
}

/** Dose against yield for ristretto, normale and lungo. */
export function RatioFigure() {
  const rows = [
    { y: 26, w: 118, out: "18g", name: "Ristretto", sub: "1:1  ·  thick and sweet", tx: 264 },
    { y: 86, w: 236, out: "36g", name: "Normale", sub: "1:2  ·  the default", tx: 382 },
    { y: 146, w: 354, out: "54g", name: "Lungo", sub: "1:3  ·  lighter, brighter", tx: 500 },
  ];
  return (
    <Figure
      height={186}
      /* The Lungo row starts its text at x=500, and "1:3 · lighter, brighter"
         needs roughly 140 units after that, which overruns the usual 620. */
      width={660}
      label="Three bars showing dose against yield. Ristretto one to one, normale one to two, lungo one to three."
      caption="Same 18g of coffee in every row. The only thing changing is how much liquid you let out before you stop the shot."
    >
      <text x="0" y="12" className={LABEL}>Coffee in</text>
      <text x="130" y="12" className={LABEL}>Espresso out</text>
      {rows.map((r) => (
        <g key={r.name}>
          <rect x="0" y={r.y} width="118" height="34" fill="currentColor" opacity="0.85" />
          <text x="12" y={r.y + 22} className="text-xs fill-card">18g</text>
          <rect x="130" y={r.y} width={r.w} height="34" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <text x="142" y={r.y + 22} className={TEXT}>{r.out}</text>
          <text x={r.tx} y={r.y + 15} className={STRONG}>{r.name}</text>
          <text x={r.tx} y={r.y + 31} className={TEXT}>{r.sub}</text>
        </g>
      ))}
    </Figure>
  );
}

/** 58mm against 51mm, same dose, showing bed depth. */
export function PortafilterFigure() {
  return (
    <Figure
      height={238}
      label="Cross sections of a 58mm and a 51mm basket holding the same dose. The wider basket gives a shallower, wider coffee bed."
      caption="Both baskets hold the same weight of coffee. The wider one spreads it into a shallower bed, which is the whole argument for 58mm."
    >
      <text x="0" y="12" className={LABEL}>58mm basket</text>
      <text x="340" y="12" className={LABEL}>51mm basket</text>

      <path d="M20 34 L20 120 Q20 132 34 132 L246 132 Q260 132 260 120 L260 34" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M22 78 L22 118 Q22 130 36 130 L244 130 Q258 130 258 118 L258 78 Z" fill="currentColor" opacity="0.28" />
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.9">
        {[60, 105, 150, 195, 240].map((x) => <path key={x} d={`M${x} 44 L${x} 74`} />)}
      </g>
      <path d="M20 152 L260 152" stroke="currentColor" strokeWidth="1" />
      <path d="M20 147 L20 157 M260 147 L260 157" stroke="currentColor" strokeWidth="1" />
      <text x="118" y="170" className={TEXT}>58mm</text>
      <path d="M280 78 L280 130" stroke="currentColor" strokeWidth="1" />
      <path d="M275 78 L285 78 M275 130 L285 130" stroke="currentColor" strokeWidth="1" />
      <text x="268" y="150" className={TEXT}>shallow</text>
      <text x="0" y="196" className={STRONG}>Short path through the puck</text>
      <text x="0" y="215" className={TEXT}>Water reaches the bottom sooner and more evenly.</text>

      <path d="M368 34 L368 120 Q368 132 382 132 L562 132 Q576 132 576 120 L576 34" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M370 62 L370 118 Q370 130 384 130 L560 130 Q574 130 574 118 L574 62 Z" fill="currentColor" opacity="0.28" />
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.9">
        {[405, 450, 495, 540].map((x) => <path key={x} d={`M${x} 40 L${x} 58`} />)}
      </g>
      <path d="M368 152 L576 152" stroke="currentColor" strokeWidth="1" />
      <path d="M368 147 L368 157 M576 147 L576 157" stroke="currentColor" strokeWidth="1" />
      <text x="452" y="170" className={TEXT}>51mm</text>
      <path d="M596 62 L596 130" stroke="currentColor" strokeWidth="1" />
      <path d="M591 62 L601 62 M591 130 L601 130" stroke="currentColor" strokeWidth="1" />
      <text x="586" y="150" className={TEXT}>deep</text>
      <text x="340" y="196" className={STRONG}>Longer path through the puck</text>
      <text x="340" y="215" className={TEXT}>More coffee to travel through, and</text>
      <text x="340" y="232" className={TEXT}>more chance for water to go astray.</text>
    </Figure>
  );
}

/** Reddit mark, path from simple-icons (CC0-1.0). Inherits currentColor. */
export function RedditMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z" />
    </svg>
  );
}
