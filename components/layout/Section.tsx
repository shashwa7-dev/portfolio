import Band from "./Band";
import BandLabel from "./BandLabel";
import Container from "./Container";

type Props = {
  id?: string;
  number?: string;
  /** Total sections on this route, so the label can read `[ 02 / 06 ]`. */
  of?: string;
  label?: string;
  title?: string;
  action?: React.ReactNode;
  width?: "reading" | "wide";
  className?: string;
  children: React.ReactNode;
};

/**
 * A numbered section: a full-bleed band carrying the number and label, then
 * the content beneath it.
 *
 * The number and label used to sit inside the text column as an eyebrow above
 * the title. Lifting them out into a band is the point of the change: a
 * caption describes the paragraph under it, whereas a band that crosses the
 * page's rails divides the page, which is what a numbered section actually
 * does.
 *
 * The title stays in the column with the content, where it belongs. It is a
 * heading for the material, not a piece of page structure, and a band holding
 * both a coordinate and a sentence reads as a title bar.
 *
 * Vertical rhythm moved from the `<section>` onto the inner Container so the
 * band can reach the full width of the page without inheriting the padding
 * that keeps the content off the rails.
 */
export default function Section({
  id,
  number,
  of,
  label,
  title,
  action,
  width = "reading",
  className,
  children,
}: Props) {
  const hasBand = Boolean(number || label || action);

  return (
    <section id={id} className={className}>
      {hasBand && (
        <Band>
          <BandLabel id={number ?? ""} of={of} name={label} />
          {action}
        </Band>
      )}
      <Container width={width} className="py-10 md:py-14">
        {title && (
          <h2 className="mb-8 text-2xl text-foreground md:text-3xl">{title}</h2>
        )}
        {children}
      </Container>
    </section>
  );
}
