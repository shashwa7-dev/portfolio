import Container from "./Container";
import SectionLabel from "./SectionLabel";

type Props = {
  id?: string;
  /** The label above the title, e.g. "Work": a dot-matrix glyph, the label in the dot face, then a dotted leader. */
  label?: string;
  title?: string;
  /** Right-aligned beside the label, e.g. a "View all" link. */
  action?: React.ReactNode;
  width?: "reading" | "wide";
  className?: string;
  children: React.ReactNode;
};

/**
 * A homepage-style section: the shared label row (SectionLabel), an optional
 * title, then the content. Top padding only (`pt-9 md:pt-11`, 36px and 44px), so the gap between
 * two sections is one step, the same as the gap under the intro. With padding
 * on both sides it was two steps, and the page read as looser below the hero.
 */
export default function Section({ id, label, title, action, width = "reading", className, children }: Props) {
  return (
    <section id={id} className={className}>
      <Container width={width} className="scroll-mt-16 pt-9 md:pt-11">
        {label ? (
          <SectionLabel label={label} as={title ? "p" : "h2"} action={action} className={title ? "mb-2" : "mb-6"} />
        ) : (
          action && <div className="mb-2 flex justify-end">{action}</div>
        )}
        {title && <h2 className="mb-5 text-xl font-medium tracking-tight text-foreground md:text-2xl">{title}</h2>}
        {children}
      </Container>
    </section>
  );
}
