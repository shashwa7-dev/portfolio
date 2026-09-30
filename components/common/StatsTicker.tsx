import { tickerStats } from "@/lib/stats";

function Items({ copy }: { copy?: boolean }) {
  return (
    <ul
      aria-label={copy ? undefined : "Highlights"}
      aria-hidden={copy || undefined}
      data-ticker-copy={copy ? "" : undefined}
      className="flex shrink-0 items-center gap-x-7 gap-y-2 pr-7"
    >
      {tickerStats.map((s) => (
        <li key={s.n} className="flex items-center gap-7 whitespace-nowrap text-sm text-muted-foreground">
          <span>
            <strong className="font-semibold text-foreground">{s.n}</strong> {s.c}
            {s.context && <span className="text-subtle"> · {s.context}</span>}
          </span>
          <span aria-hidden className="text-border-strong">✦</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The intro's proof points as one slow line, clipped to the reading column and
 * faded at both edges. Rendered twice so the -50% loop is seamless; the copy is
 * hidden from assistive tech and removed entirely under reduced motion, where
 * the first list wraps instead of drifting.
 */
export default function StatsTicker() {
  return (
    <div className="ticker-mask">
      <div className="ticker-track">
        <Items />
        <Items copy />
      </div>
    </div>
  );
}
