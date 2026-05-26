import { cn } from "@/lib/utils";
import Container from "./Container";
import Label from "./Label";

type Props = {
  id?: string;
  number?: string;
  label?: string;
  title?: string;
  action?: React.ReactNode;
  width?: "reading" | "wide";
  className?: string;
  children: React.ReactNode;
};

export default function Section({
  id,
  number,
  label,
  title,
  action,
  width = "reading",
  className,
  children,
}: Props) {
  return (
    <section id={id} className={cn("py-10 md:py-14", className)}>
      <Container width={width}>
        {(number || label || title || action) && (
          <div className="mb-8 flex items-end justify-between gap-4">
            <div className="space-y-1.5">
              {(label || number) && (
                <Label>
                  {number && <span className="text-accent-hover">{number}</span>}
                  {number && label ? "  /  " : ""}
                  {label}
                </Label>
              )}
              {title && (
                <h2 className="font-serif text-2xl md:text-[1.75rem] text-foreground">
                  {title}
                </h2>
              )}
            </div>
            {action}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
