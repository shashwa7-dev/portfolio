import type { ReactNode } from "react";

/**
 * Crossfades between two states in a fixed grid cell so the container never
 * reflows. Used by the copy buttons. Scales from 0.8, never 0: nothing in
 * the real world appears from nothing.
 *
 * `aria-hidden` flips with the state so a screen reader announces only the
 * active label, not both.
 */
export default function IconSwap({
  swapped,
  from,
  to,
  className = "",
}: {
  swapped: boolean;
  from: ReactNode;
  to: ReactNode;
  className?: string;
}) {
  const base =
    "col-start-1 row-start-1 inline-flex items-center gap-1 " +
    "transition-[opacity,transform] duration-fast ease-out";

  return (
    <span className={`inline-grid place-items-center ${className}`}>
      <span
        aria-hidden={swapped}
        className={base}
        style={{ opacity: swapped ? 0 : 1, transform: swapped ? "scale(0.8)" : "scale(1)" }}
      >
        {from}
      </span>
      <span
        aria-hidden={!swapped}
        className={base}
        style={{ opacity: swapped ? 1 : 0, transform: swapped ? "scale(1)" : "scale(0.8)" }}
      >
        {to}
      </span>
    </span>
  );
}
