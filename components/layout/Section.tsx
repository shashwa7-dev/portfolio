import Container from "./Container";

type Props = {
  id?: string;
  /** Small muted label above the title, e.g. "Work". Plain text: no band, no number. */
  label?: string;
  title?: string;
  /** Right-aligned beside the label, e.g. a "View all" link. */
  action?: React.ReactNode;
  width?: "reading" | "wide";
  className?: string;
  children: React.ReactNode;
};

/**
 * A homepage-style section. Whitespace is the only separator: no band, no
 * rule, no numbering. Top padding only (`pt-10 md:pt-12`), so the gap between
 * two sections is one step, the same as the gap under the intro. With padding
 * on both sides it was two steps, and the page read as looser below the hero.
 */
export default function Section({ id, label, title, action, width = "reading", className, children }: Props) {
  return (
    <section id={id} className={className}>
      <Container width={width} className="scroll-mt-16 pt-10 md:pt-12">
        {(label || action) && (
          <div className="mb-2 flex items-center justify-between gap-4">
            {label && <p className="text-sm text-subtle">{label}</p>}
            {action}
          </div>
        )}
        {title && <h2 className="mb-8 text-2xl font-medium tracking-tight text-foreground md:text-3xl">{title}</h2>}
        {children}
      </Container>
    </section>
  );
}
