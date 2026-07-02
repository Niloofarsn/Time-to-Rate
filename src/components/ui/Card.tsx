import type { ReactNode } from "react";
import "./Card.css";

export function Card({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return <div className={`card ${padded ? "card--padded" : ""} ${className}`}>{children}</div>;
}
