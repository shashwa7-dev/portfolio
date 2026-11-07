type Props = { idPrefix: string; className?: string };

const C = 100;

function pt(r: number, a: number) {
  return `${(C + r * Math.cos(a)).toFixed(2)} ${(C + r * Math.sin(a)).toFixed(2)}`;
}

export function Chakri({ idPrefix, className }: Props) {
  const stripes = Array.from({ length: 36 }, (_, i) => {
    const a0 = (i / 36) * Math.PI * 2;
    const a1 = a0 + ((Math.PI * 2) / 36) * 0.32;
    const sk = 0.09;
    return (
      <path
        key={i}
        d={`M${pt(99, a0)} L${pt(99, a1)} L${pt(83, a1 + sk)} L${pt(83, a0 + sk)} Z`}
        fill={i % 2 ? "#d7263d" : "#2fa6c9"}
      />
    );
  });

  const dots = Array.from({ length: 32 }, (_, i) => {
    const a = (i / 32) * Math.PI * 2;
    return (
      <circle
        key={i}
        cx={(C + 64 * Math.cos(a)).toFixed(2)}
        cy={(C + 64 * Math.sin(a)).toFixed(2)}
        r="3.1"
        fill="#e9b955"
      />
    );
  });

  let star = "";
  const SP = 14;
  for (let i = 0; i < SP * 2; i++) {
    const r = i % 2 ? 36 : 52;
    const a = (i / (SP * 2)) * Math.PI * 2 - Math.PI / 2;
    star += (i ? "L" : "M") + (C + r * Math.cos(a)).toFixed(2) + " " + (C + r * Math.sin(a)).toFixed(2);
  }

  const ripples = [34, 30, 26].map((R, k) => {
    let d = "";
    for (let i = 0; i <= 120; i++) {
      const a = (i / 120) * Math.PI * 2;
      const r = R + 1.4 * Math.sin(a * 18 + k);
      d += (i ? "L" : "M") + (C + r * Math.cos(a)).toFixed(2) + " " + (C + r * Math.sin(a)).toFixed(2);
    }
    return <path key={k} d={`${d}Z`} fill="none" stroke="#e9b955" strokeWidth="1.3" />;
  });

  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`${idPrefix}-cp`} cx="50%" cy="45%" r="60%">
          <stop offset="0" stopColor="#8e2bb8" />
          <stop offset="1" stopColor="#4a0f72" />
        </radialGradient>
        <radialGradient id={`${idPrefix}-cg`} cx="45%" cy="40%" r="65%">
          <stop offset="0" stopColor="#ffe9a3" />
          <stop offset=".6" stopColor="#e0a83a" />
          <stop offset="1" stopColor="#b9781c" />
        </radialGradient>
        <linearGradient id={`${idPrefix}-gb`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7d27a" />
          <stop offset=".5" stopColor="#c98a2a" />
          <stop offset="1" stopColor="#f2c565" />
        </linearGradient>
      </defs>
      <circle cx={C} cy={C} r="93" fill="#fbfbf7" />
      {stripes}
      <circle cx={C} cy={C} r="99" fill="none" stroke="#e8e2d6" strokeWidth="1" />
      <circle cx={C} cy={C} r="83" fill={`url(#${idPrefix}-gb)`} />
      <circle cx={C} cy={C} r="79" fill={`url(#${idPrefix}-cp)`} />
      <circle cx={C} cy={C} r="72" fill="none" stroke="#e3b04b" strokeWidth="1.2" />
      {dots}
      <circle cx={C} cy={C} r="56" fill="none" stroke="#e3b04b" strokeWidth="1.2" />
      <path d={`${star}Z`} fill={`url(#${idPrefix}-gb)`} />
      <circle cx={C} cy={C} r="37" fill="#5c1585" />
      {ripples}
      <circle cx={C} cy={C} r="22" fill={`url(#${idPrefix}-cg)`} />
    </svg>
  );
}
