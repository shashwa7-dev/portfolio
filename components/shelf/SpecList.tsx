/**
 * A spec sheet: a mono key in a fixed column, the entry beside it, one hairline
 * between rows.
 *
 * This is not a new device. The desk list already laid itself out exactly this
 * way, inline, with a `sm:w-24` mono label and the content in the rest of the
 * row. Pulling it out and adding the rules is what lets three short lists share
 * one section instead of taking a band, a title and `py-10 md:py-14` each to
 * say three rows, two rows and a strip of album art.
 *
 * The key column is the same `Label` typography a band uses, which is the point:
 * a reader who has learnt that mono caps in this page mean "this is what the
 * next thing is" does not have to learn it twice.
 *
 * Rows stack on a phone. At 640px a 6rem key column plus a note leaves the note
 * about 30 characters wide, which is narrower than the notes actually are.
 */
export function SpecList({ children }: { children: React.ReactNode }) {
  return <ul className="divide-y divide-border">{children}</ul>;
}

export function SpecRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="grid gap-1.5 py-5 first:pt-0 last:pb-0 sm:grid-cols-[6rem_1fr] sm:gap-6">
      <span className="font-mono text-2xs uppercase tracking-label text-subtle">
        {label}
      </span>
      <div className="min-w-0">{children}</div>
    </li>
  );
}
