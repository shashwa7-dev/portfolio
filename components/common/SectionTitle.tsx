import { cn } from "@/lib/utils";
import React from "react";

interface SectionTitleProps {
  title: string;
  icon?: React.ReactNode;
  align?: "left" | "center" | "right";
  underline?: boolean;
  className?: string;
  variant?: "default" | "huge";
}

const alignMap = {
  left: "justify-start text-left",
  center: "justify-center text-center",
  right: "justify-end text-right",
};

const variantMap = {
  default: {
    wrapper: "border-l-4 border-b p-0.5 px-1.5",
    title: "text-base font-medium",
  },
  huge: {
    wrapper: "border-none p-0",
    title: "text-3xl",
  },
};

const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  icon,
  align = "left",
  underline = true,
  className = "",
  variant = "default",
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5",
        alignMap[align],
        variantMap[variant].wrapper,
        className
      )}
    >
      {icon && <span>{icon}</span>}

      <p
        className={cn(
          "font-sans text-secondary-foreground",
          variantMap[variant].title,
          underline && variant === "default" && "pb-1 border-border"
        )}
      >
        {title}
      </p>
    </div>
  );
};

export default SectionTitle;
