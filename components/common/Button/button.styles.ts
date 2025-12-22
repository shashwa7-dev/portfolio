import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const baseStyles =
  "inline-flex items-center gap-1.5 rounded-md border border-b-4 font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground border-border hover:bg-primary/90 active:bg-primary/80 active:translate-y-px",
  secondary:
    "bg-[hsl(var(--button-secondary))] text-[hsl(var(--button-secondary-foreground))] border-[hsl(var(--button-secondary-hover))] hover:bg-[hsl(var(--button-secondary-hover))]",
  ghost:
    "bg-transparent text-[hsl(var(--button-secondary-foreground))] border-transparent hover:bg-[hsl(var(--button-secondary))] active:bg-[hsl(var(--button-secondary-hover))]",
  danger:
    "bg-[hsl(var(--button-danger))] text-white border-[hsl(var(--button-danger-hover))] hover:bg-[hsl(var(--button-danger-hover))]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "p-1 px-2 text-xs",
  md: "h-9 px-2.5 text-sm",
  lg: "h-10 px-3 text-sm",
};

export function buttonClasses({
  variant = "secondary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(baseStyles, variantStyles[variant], sizeStyles[size], className);
}
