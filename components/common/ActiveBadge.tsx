import { cn } from "@/lib/utils";

interface ActiveBadgeProps {
  label?: string;
  variant?: "default" | "overlay" | "pill" | "minimal";
  className?: string;
}

const variantStyles = {
  default:
    "inline-flex items-center gap-1.5 rounded-md border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400",
  overlay:
    "inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/20 px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400 backdrop-blur-sm",
  pill:
    "inline-flex items-center gap-1.5 rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-500 dark:text-green-400",
  minimal:
    "inline-flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400",
} as const;

export function ActiveBadge({
  label = "Active",
  variant = "default",
  className,
}: ActiveBadgeProps) {
  return (
    <span className={cn(variantStyles[variant], className)}>
      <span
        className="size-1.5 shrink-0 rounded-full bg-green-500 animate-pulse"
        aria-hidden
      />
      {label}
    </span>
  );
}
