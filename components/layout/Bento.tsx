import { cn } from "@/lib/utils";

export default function Bento({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div className={cn("grid gap-px bg-border", className)}>{children}</div>
    </div>
  );
}
