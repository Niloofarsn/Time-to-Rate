import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, StatusBadge, FeedbackModal } from "../../../components/ui";
import { useEditStudy } from "../useEditStudy";
import { useAuth } from "../../../context/AuthContext";
import { RequestActivationModal } from "../../../components/shared/RequestActivationModal";
import { approveStudy } from "../../../lib/avvisiApi";
import { formatDate, formatDateRange } from "../../../lib/format";

export function EditAttivazione() {
  const navigate = useNavigate();
  const { id, study, update } = useEditStudy();
  const { role } = useAuth();
  const [requesting, setRequesting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!study) return null;

  const today = new Date().toISOString().slice(0, 10);
  const canActivate = role === "PI" || role === "ADMIN";

  const activate = async () => {
    setError(null);
    try {
      if (id) await approveStudy(id);
      update({ status: "attivo", startDate: study.startDate ?? today });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Attivazione non riuscita");
    }
  };

  return (
    <div>
      <div className="wizard__heading">
        <h4 className="wizard__title">Attivazione</h4>
        <p className="muted text-sm">Stato di attivazione dello studio.</p>
      </div>

      <div className="activation">
        <div className="activation__card">
          <i className="bi bi-check-circle-fill activation__check" aria-hidden />
          <div style={{ flex: 1 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <h6 style={{ marginBottom: 4 }}>{study.title || "Studio senza titolo"}</h6>
              <StatusBadge status={study.status} />
            </div>
            <p className="text-sm muted" style={{ marginBottom: 8 }}>
              {study.description || "Nessuna descrizione."}
            </p>
            <p className="text-sm">
              <i className="bi bi-calendar3" aria-hidden /> {formatDateRange(study.startDate, study.endDate)}
              {"  ·  "}
              Principal Investigator: <strong>{study.piName}</strong>
            </p>
            <p className="text-sm muted" style={{ marginTop: 4 }}>
              Data di aggiornamento: {formatDate(today)}
            </p>

            {error && (
              <p className="text-sm" style={{ color: "var(--color-danger)", marginTop: 8 }}>
                <i className="bi bi-exclamation-circle" aria-hidden /> {error}
              </p>
            )}

            <div className="row" style={{ marginTop: "var(--space-3)", gap: "var(--space-2)" }}>
              {study.status === "attivo" ? (
                <Button
                  variant="outline-secondary"
                  icon="pause-circle"
                  onClick={() => update({ status: "completato" })}
                >
                  Concludi studio
                </Button>
              ) : canActivate ? (
                <Button icon="rocket-takeoff" onClick={activate}>
                  Attiva lo studio
                </Button>
              ) : (
                <Button icon="send" onClick={() => setRequesting(true)}>
                  Richiedi attivazione
                </Button>
              )}
              <Button variant="base" onClick={() => navigate(`/studi/${id}`)}>
                Vai alla dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {requesting && id && (
        <RequestActivationModal
          studyId={id}
          onClose={() => setRequesting(false)}
          onSent={() => {
            setRequesting(false);
            setSent(true);
          }}
        />
      )}

      <FeedbackModal
        open={sent}
        variant="success"
        title="Richiesta inviata"
        message="La richiesta di attivazione è stata inviata al PI selezionato."
        onClose={() => setSent(false)}
      />
    </div>
  );
}
