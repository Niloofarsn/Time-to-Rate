import type { ReactNode } from "react";
import { Button } from "../../components/ui";

/** Section header: title on the left, an "Aggiungi" action on the right. */
export function SectionHeader({
  title,
  onAdd,
  addLabel = "Aggiungi",
}: {
  title: string;
  onAdd?: () => void;
  addLabel?: string;
}) {
  return (
    <div className="wizard__heading" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <h4 className="wizard__title">{title}</h4>
      {onAdd && (
        <Button icon="plus-lg" onClick={onAdd}>
          {addLabel}
        </Button>
      )}
    </div>
  );
}

/** "Come procedere" collapsible help banner shown at the top of each section. */
export function ComeProcedere({ children }: { children: ReactNode }) {
  return (
    <div className="wizard__section-note" style={{ display: "flex", gap: 10 }}>
      <i className="bi bi-info-circle" aria-hidden style={{ marginTop: 2 }} />
      <div>
        <strong>Come procedere</strong>
        <div style={{ marginTop: 4 }}>{children}</div>
      </div>
    </div>
  );
}
