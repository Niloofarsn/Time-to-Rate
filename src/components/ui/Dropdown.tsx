import { useEffect, useRef, useState, type ReactNode } from "react";
import "./Dropdown.css";

export interface DropdownItem {
  label: string;
  icon?: string;
  onClick: () => void;
  danger?: boolean;
}

export function Dropdown({
  trigger,
  items,
  align = "right",
}: {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="dropdown" ref={ref}>
      <span className="dropdown__trigger" onClick={() => setOpen((v) => !v)}>
        {trigger}
      </span>
      {open && (
        <div className={`dropdown__menu dropdown__menu--${align}`}>
          {items.map((item) => (
            <button
              key={item.label}
              className={`dropdown__item ${item.danger ? "is-danger" : ""}`}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
            >
              {item.icon && <i className={`bi bi-${item.icon}`} aria-hidden />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
