import { cn } from "@/lib/utils";
import React from "react";

interface SectionTitleProps {
  title: string;
  icon?: React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
  variant?: "default" | "large";
}

const alignMap = {
  left: "justify-start text-left",
  center: "justify-center text-center",
  right: "justify-end text-right",
};

const variantMap = {
  default: {
    wrapper: "",
    title: "text-sm font-semibold uppercase tracking-wider",
  },
  large: {
    wrapper: "",
    title: "text-xl font-semibold tracking-tight",
  },
};

const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  icon,
  align = "left",
  className = "",
  variant = "default",
}) => {
  const showAccentBar = align === "left";

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        alignMap[align],
        showAccentBar && "border-l-2 border-accent pl-2.5 -ml-px",
        variantMap[variant].wrapper,
        className
      )}
    >
      {icon && (
        <span className="shrink-0 text-accent" aria-hidden>
          {icon}
        </span>
      )}
      <h2
        className={cn(
          "text-foreground",
          variantMap[variant].title
        )}
      >
        {title}
      </h2>
    </div>
  );
};

export default SectionTitle;
