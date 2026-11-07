const GOLD = "#d9a53a";

type Props = { corner: "tl" | "tr" | "bl" | "br"; className?: string };

const FLIP: Record<Props["corner"], string | undefined> = {
  tl: undefined,
  tr: "scaleX(-1)",
  bl: "scaleY(-1)",
  br: "scale(-1,-1)",
};

export function CornerMotif({ corner, className }: Props) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={{ transform: FLIP[corner] }}
      aria-hidden="true"
    >
      <path d="M4 4 H70 M4 4 V70" stroke={GOLD} strokeWidth="2.5" fill="none" />
      <path
        d="M22 22 C 46 16, 58 34, 46 46 C 38 54, 26 48, 30 38 C 33 31, 42 33, 40 39"
        stroke={GOLD}
        strokeWidth="2"
        fill="rgba(217,165,58,.12)"
      />
      <circle cx="38" cy="38" r="2.6" fill="#c0392b" />
      <path d="M64 14 q6 -8 12 0 q-6 6 -12 0z M14 64 q-8 6 0 12 q6 -6 0 -12z" fill={GOLD} />
    </svg>
  );
}
