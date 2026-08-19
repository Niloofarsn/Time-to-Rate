import { useNavigate } from "react-router-dom";
import { Button, StatusBadge } from "../../../components/ui";
import { useEditStudy } from "../useEditStudy";
import { formatDate, formatDateRange } from "../../../lib/format";

export function EditAttivazione() {
  const navigate = useNavigate();
  const { id, study, update } = useEditStudy();
  if (!study) return null;

  const today = new Date().toISOString().slice(0, 10);

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

            <div className="row" style={{ marginTop: "var(--space-3)", gap: "var(--space-2)" }}>
              {study.status === "attivo" ? (
                <Button
                  variant="outline-secondary"
                  icon="pause-circle"
                  onClick={() => update({ status: "completato" })}
                >
                  Concludi studio
                </Button>
              ) : (
                <Button icon="rocket-takeoff" onClick={() => update({ status: "attivo", startDate: study.startDate ?? today })}>
                  Attiva lo studio
                </Button>
              )}
              <Button variant="base" onClick={() => navigate(`/studi/${id}`)}>
                Vai alla dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
