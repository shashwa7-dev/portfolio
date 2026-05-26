import { cn } from "@/lib/utils";
import Container from "./Container";
import Label from "./Label";

type Props = {
  id?: string;
  label?: string;
  title?: string;
  action?: React.ReactNode;
  width?: "reading" | "wide";
  className?: string;
  children: React.ReactNode;
};

export default function Section({
  id,
  label,
  title,
  action,
  width = "reading",
  className,
  children,
}: Props) {
  return (
    <section id={id} className={cn("py-16 md:py-24", className)}>
      <Container width={width}>
        {(label || title || action) && (
          <div className="mb-8 flex items-end justify-between gap-4">
            <div className="space-y-1.5">
              {label && <Label>{label}</Label>}
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
