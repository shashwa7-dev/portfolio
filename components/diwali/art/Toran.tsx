import styles from "../diwali.module.css";

type Props = { width: number; idPrefix: string };

export function Toran({ width: W, idPrefix }: Props) {
  const swags = Math.max(2, Math.round(W / 260));
  const sw = W / swags;
  const sag = W < 600 ? 34 : 46;
  const R = W < 600 ? 6 : 7;
  const leaves = Math.round(W / 34);
  const out: React.ReactNode[] = [];

  for (let i = 0; i < leaves; i++) {
    const x = ((i + 0.5) * W) / leaves;
    const L = (W < 600 ? 24 : 30) + (i % 3) * 6;
    const rot = i % 2 ? 6 : -6;
    out.push(
      <path
        key={`l${i}`}
        d={`M${x} 6 C ${x - 9} ${6 + L * 0.35}, ${x - 7} ${6 + L * 0.8}, ${x} ${6 + L} C ${x + 7} ${6 + L * 0.8}, ${x + 9} ${6 + L * 0.35}, ${x} 6 Z`}
        fill={i % 2 ? "#2f7d32" : "#3d9a40"}
        transform={`rotate(${rot} ${x} 6)`}
      />,
    );
  }

  for (let k = 0; k < swags; k++) {
    const x0 = k * sw;
    const n = Math.round(sw / (R * 1.7));
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const x = x0 + u * sw;
      const y = 10 + sag * Math.sin(Math.PI * u);
      out.push(
        <circle
          key={`s${k}-${i}`}
          cx={x.toFixed(1)}
          cy={y.toFixed(1)}
          r={R}
          fill={`url(#${idPrefix}-mg${(i + k) % 3 ? 1 : 2})`}
        />,
      );
    }
    if (k > 0) {
      for (let j = 0; j < 4; j++) {
        out.push(
          <circle
            key={`j${k}-${j}`}
            cx={x0}
            cy={16 + j * 11}
            r={R - 1}
            fill={`url(#${idPrefix}-mg${j % 2 ? 1 : 2})`}
          />,
        );
      }
      out.push(
        <path key={`b${k}`} d={`M${x0 - 6} 74 Q ${x0} 60 ${x0 + 6} 74 Z`} fill="#d9a520" />,
      );
    }
  }

  return (
    <svg viewBox={`0 0 ${W} 140`} preserveAspectRatio="xMidYMin meet" aria-hidden="true">
      <defs>
        <radialGradient id={`${idPrefix}-mg1`} cx="40%" cy="35%">
          <stop offset="0" stopColor="#ffd25a" />
          <stop offset="1" stopColor="#f08a00" />
        </radialGradient>
        <radialGradient id={`${idPrefix}-mg2`} cx="40%" cy="35%">
          <stop offset="0" stopColor="#ffb347" />
          <stop offset="1" stopColor="#e05a00" />
        </radialGradient>
      </defs>
      <g className={styles.sway}>
        <g transform="translate(0 -18)">{out}</g>
      </g>
    </svg>
  );
}
