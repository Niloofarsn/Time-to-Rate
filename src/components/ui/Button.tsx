import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.css";

type Variant = "primary" | "secondary" | "base" | "outline" | "outline-secondary" | "link" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: string; // bootstrap-icon name, e.g. "plus-lg"
  iconRight?: string;
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  const iconOnly = !children;
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${iconOnly ? "btn--icon" : ""} ${className}`}
      {...rest}
    >
      {icon && <i className={`bi bi-${icon}`} aria-hidden />}
      {children}
      {iconRight && <i className={`bi bi-${iconRight}`} aria-hidden />}
    </button>
  );
}
