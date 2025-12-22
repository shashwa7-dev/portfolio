import React, { ButtonHTMLAttributes } from "react";
import { buttonClasses, ButtonSize, ButtonVariant } from "./button.styles";

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const Button = ({
  children,
  variant = "secondary",
  size = "md",
  className,
  ...props
}: BtnProps) => {
  return (
    <button className={buttonClasses({ variant, size, className })} {...props}>
      {children}
    </button>
  );
};

export default Button;
