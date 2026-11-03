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
        "font-label text-xs uppercase tracking-label text-subtle",
        className
      )}
    >
      {children}
    </span>
  );
}
