const C = 200;

function ring(n: number, r: number, len: number, wid: number, col: string, rot = 0) {
  return Array.from({ length: n }, (_, i) => (
    <ellipse
      key={`${col}-${r}-${i}`}
      cx={C}
      cy={C - r}
      rx={wid}
      ry={len}
      fill={col}
      transform={`rotate(${(i / n) * 360 + rot} ${C} ${C})`}
    />
  ));
}

export function Rangoli() {
  return (
    <svg viewBox="0 0 400 400" aria-hidden="true">
      <circle cx={C} cy={C} r="196" fill="#4a0d14" />
      <circle
        cx={C}
        cy={C}
        r="190"
        fill="none"
        stroke="#b8892f"
        strokeWidth="2.5"
        strokeDasharray="2 8"
        strokeLinecap="round"
      />
      {ring(32, 168, 20, 9, "#a8461f")}
      {ring(32, 168, 12, 5, "#b8892f", 5.6)}
      <circle cx={C} cy={C} r="140" fill="#1f3d2c" />
      {ring(24, 118, 24, 11, "#8c2f4a")}
      {ring(24, 118, 14, 6, "#c9b48a", 7.5)}
      <circle cx={C} cy={C} r="92" fill="#223358" />
      {ring(16, 66, 24, 12, "#b0662a")}
      {ring(16, 66, 14, 6, "#d8c9a3", 11.25)}
      <circle cx={C} cy={C} r="40" fill="#9a5a1c" />
      <circle cx={C} cy={C} r="26" fill="#7c2240" />
      <circle cx={C} cy={C} r="12" fill="#c9a13c" />
    </svg>
  );
}
