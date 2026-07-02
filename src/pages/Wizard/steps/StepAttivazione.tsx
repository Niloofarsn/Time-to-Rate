import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, FeedbackModal } from "../../../components/ui";
import { StepFooter } from "../StepFooter";
import { useWizardStudy } from "../useWizardStudy";
import { formatDateRange } from "../../../lib/format";

export function StepAttivazione() {
  const navigate = useNavigate();
  const { study, update, goPrev, id } = useWizardStudy("attivazione");
  const [done, setDone] = useState(false);

  if (!study) return null;

  const activate = () => {
    const today = new Date().toISOString().slice(0, 10);
    update({
      status: "attivo",
      startDate: study.startDate ?? today,
    });
    setDone(true);
  };

  return (
    <div>
      <div className="wizard__heading">
        <h4 className="wizard__title">Attivazione</h4>
        <p className="muted text-sm">Attiva lo studio per renderlo disponibile ai partecipanti.</p>
      </div>

      <div className="activation">
        <div className="activation__card">
          <i className="bi bi-check-circle-fill activation__check" aria-hidden />
          <div>
            <h6 style={{ marginBottom: 4 }}>{study.title || "Studio senza titolo"}</h6>
            <p className="text-sm muted" style={{ marginBottom: 8 }}>
              {study.description || "Nessuna descrizione."}
            </p>
            <p className="text-sm">
              <i className="bi bi-calendar3" aria-hidden /> {formatDateRange(study.startDate, study.endDate)}
              {"  ·  "}
              <i className="bi bi-people" aria-hidden /> {study.participants.length} partecipanti
              {"  ·  "}
              Codice: <strong>{study.code}</strong>
            </p>
            <div style={{ marginTop: "var(--space-3)" }}>
              <Button icon="rocket-takeoff" onClick={activate} disabled={study.status === "attivo"}>
                {study.status === "attivo" ? "Studio attivo" : "Attiva lo studio"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <StepFooter onPrev={goPrev} showPrev />

      <FeedbackModal
        open={done}
        variant="success"
        title="Studio attivato"
        message="Lo studio è stato attivato correttamente ed è ora disponibile per i partecipanti."
        actionLabel="Vai alla dashboard"
        onAction={() => navigate(`/studi/${id}`)}
        onClose={() => navigate(`/studi/${id}`)}
      />
    </div>
  );
}
