import { useEffect, type ReactNode } from "react";
import "./Modal.css";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Modal({ open, onClose, title, children, footer, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className={`modal modal--${size}`}
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal__head">
          {title ? <h5 className="modal__title">{title}</h5> : <span />}
          <button className="modal__close" onClick={onClose} aria-label="Chiudi">
            <i className="bi bi-x-lg" aria-hidden />
          </button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  );
}

/** Small centered feedback modal (Successo / Attenzione / Errore) */
export function FeedbackModal({
  open,
  onClose,
  variant,
  title,
  message,
  actionLabel = "Ok",
  onAction,
}: {
  open: boolean;
  onClose: () => void;
  variant: "success" | "warning" | "error";
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  if (!open) return null;
  const icon =
    variant === "success" ? "check-circle-fill" : variant === "warning" ? "exclamation-circle-fill" : "x-circle-fill";
  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal modal--feedback" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Chiudi">
          <i className="bi bi-x-lg" aria-hidden />
        </button>
        <div className={`feedback__icon feedback__icon--${variant}`}>
          <i className={`bi bi-${icon}`} aria-hidden />
        </div>
        <h5 className="feedback__title">{title}</h5>
        <p className="feedback__msg muted">{message}</p>
        <div className="feedback__action">
          <button className="btn btn--primary btn--sm" onClick={onAction ?? onClose}>
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
