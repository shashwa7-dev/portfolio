import { cn } from "@/lib/utils";

export default function Bento({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border sticker candy:rounded-sticker candy:border-white">
      <div className={cn("grid gap-px bg-border candy:gap-[2px] candy:bg-foreground", className)}>{children}</div>
    </div>
  );
}
