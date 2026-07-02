import type { ReactNode } from "react";
import "./Table.css";

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="table-wrap">
      <table className="table">{children}</table>
    </div>
  );
}

export function EmptyState({
  icon = "inbox",
  title,
  subtitle,
}: {
  icon?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="empty-state">
      <i className={`bi bi-${icon}`} aria-hidden />
      <p className="empty-state__title">{title}</p>
      {subtitle && <p className="empty-state__sub muted">{subtitle}</p>}
    </div>
  );
}
