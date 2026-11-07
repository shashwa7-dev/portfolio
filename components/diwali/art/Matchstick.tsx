export function Matchstick({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 70 16" className={className} aria-hidden="true">
      <rect x="10" y="6" width="58" height="4" rx="1.5" fill="#e9c98f" />
      <ellipse cx="9" cy="8" rx="8" ry="6" fill="#c0392b" />
      <ellipse cx="7" cy="6.5" rx="3" ry="2" fill="#e8705f" />
    </svg>
  );
}
