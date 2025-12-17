import { cn } from "@/lib/utils";
import React, { HTMLAttributes, HTMLProps } from "react";

interface BtnProps extends HTMLAttributes<HTMLButtonElement> {}
const Button = ({ children, className, ...props }: BtnProps) => {
  return (
    <button
      className={cn(
        "flex items-center gap-1.5 text-muted-foreground  hover:text-foreground transition-all  p-1 px-2 border-b-4 border  text-sm bg-card rounded-md",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
