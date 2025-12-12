import React from "react";

interface SectionTitleProps {
  title: string;
  icon?: React.ReactNode;
  align?: "left" | "center" | "right";
  underline?: boolean;
  className?: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  icon,
  align = "left",
  underline = true,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center gap-1 border-l-4 border-b p-0.5 px-1.5 ${className}`}
      style={{ justifyContent: align }}
    >
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <p
        className={`font-medium text-[1rem] font-sans text-secondary-foreground tracking-tight ${
          underline ? "border-border pb-1" : ""
        }`}
      >
        {title}
      </p>
    </div>
  );
};

export default SectionTitle;
