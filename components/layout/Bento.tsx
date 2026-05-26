import { cn } from "@/lib/utils";

export default function Bento({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid gap-px overflow-hidden rounded-2xl bg-border p-px",
        className
      )}
    >
      {children}
    </div>
  );
}
