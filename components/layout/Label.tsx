import { cn } from "@/lib/utils";

export default function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-mono text-[11px] uppercase tracking-[0.16em] text-subtle",
        className
      )}
    >
      {children}
    </span>
  );
}
