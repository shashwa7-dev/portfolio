import * as React from "react"
import { cn } from "@/lib/utils"

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
  decorative?: boolean
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <div
      ref={ref}
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(
        "shrink-0 relative",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    >
      {/* Main gradient line with fade edges */}
      <div
        className={cn(
          "absolute inset-0",
          orientation === "horizontal"
            ? "bg-gradient-to-r from-transparent via-border to-transparent"
            : "bg-gradient-to-b from-transparent via-border to-transparent"
        )}
      />
      {/* Subtle accent overlay for depth */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 dark:opacity-[0.15]",
          orientation === "horizontal"
            ? "bg-gradient-to-r from-transparent via-accent/20 to-transparent"
            : "bg-gradient-to-b from-transparent via-accent/20 to-transparent"
        )}
      />
    </div>
  )
)
Separator.displayName = "Separator"

export { Separator }
