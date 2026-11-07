const GOLD = "#d9a53a";

export function LotusDivider({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 18" className={className} aria-hidden="true">
      <path d="M10 9 H96 M144 9 H230" stroke={GOLD} strokeWidth="1.2" />
      <circle cx="6" cy="9" r="2.2" fill={GOLD} />
      <circle cx="234" cy="9" r="2.2" fill={GOLD} />
      <path d="M120 1 C 113 6, 113 13, 120 17 C 127 13, 127 6, 120 1Z" fill="#e9b955" />
      <path
        d="M120 17 C 111 15, 106 10, 104 6 C 111 7, 116 11, 120 17Z M120 17 C 129 15, 134 10, 136 6 C 129 7, 124 11, 120 17Z"
        fill="#c98a22"
      />
    </svg>
  );
}
