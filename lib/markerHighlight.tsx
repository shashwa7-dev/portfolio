import Marker from "@/components/common/Marker";

/**
 * Wrap the first case-insensitive occurrence of `match` inside `text` with the
 * accent-drawn `<Marker>` underline. The rest of `text` renders as plain
 * children. If `match` is missing or not found, `text` is returned untouched.
 *
 * Use for any place where prose has one phrase you want to emphasize on
 * scroll-in (diary card summaries, page hero copy, CTA labels).
 */
export function withMarker(
  text: string,
  match: string | undefined,
  variant: "marker" | "line" = "marker",
  delay = 0
): React.ReactNode {
  if (!match) return text;
  const idx = text.toLowerCase().indexOf(match.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <Marker variant={variant} delay={delay}>
        {text.slice(idx, idx + match.length)}
      </Marker>
      {text.slice(idx + match.length)}
    </>
  );
}

/**
 * Wrap an entire string with the Marker underline. Used when the whole label
 * should be the highlight (e.g. CTA links).
 */
export function fullMarker(
  text: string,
  variant: "marker" | "line" = "marker",
  delay = 0
): React.ReactNode {
  return (
    <Marker variant={variant} delay={delay}>
      {text}
    </Marker>
  );
}
