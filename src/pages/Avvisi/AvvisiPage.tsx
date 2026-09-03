import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Tabs, EmptyState, FeedbackModal } from "../../components/ui";
import { fetchApprovals, approveStudy, type ApprovalRequest } from "../../lib/avvisiApi";
import "./AvvisiPage.css";

type Tab = "tutti" | "condivisioni" | "approvazioni";

export function AvvisiPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("tutti");
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchApprovals()
      .then(setApprovals)
      .catch((e) => setError(e instanceof Error ? e.message : "Errore nel caricamento"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const approve = async (r: ApprovalRequest) => {
    try {
      await approveStudy(r.studyId);
      setDone(r.studyName);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Approvazione non riuscita");
    }
  };

  const showApprovals = tab === "tutti" || tab === "approvazioni";

  return (
    <div className="container page">
      <div className="page-header">
        <h2>Avvisi</h2>
      </div>

      <div style={{ marginBottom: "var(--space-4)" }}>
        <Tabs<Tab>
          active={tab}
          onChange={setTab}
          tabs={[
            { value: "tutti", label: "Tutti" },
            { value: "condivisioni", label: "Condivisioni" },
            { value: "approvazioni", label: "Approvazioni" },
          ]}
        />
      </div>

      {loading && (
        <p className="muted text-sm">
          <i className="bi bi-arrow-repeat" aria-hidden /> Caricamento…
        </p>
      )}
      {error && (
        <p
          className="text-sm"
          style={{
            color: "var(--color-danger)",
            background: "var(--soft-red-bg)",
            padding: "8px 12px",
            borderRadius: "var(--radius-control)",
            marginBottom: "var(--space-3)",
          }}
        >
          <i className="bi bi-exclamation-circle" aria-hidden /> {error}
        </p>
      )}

      {!loading && (
        <div className="avvisi-list">
          {showApprovals &&
            approvals.map((r) => (
              <Card key={r.studyId} className="avviso">
                <span className="avviso__icon">
                  <i className="bi bi-clipboard-check" aria-hidden />
                </span>
                <div className="avviso__body">
                  <p className="avviso__title">
                    {r.requestedBy} richiede l'approvazione di un nuovo studio
                  </p>
                  <p className="avviso__study">{r.studyName}</p>
                  {r.studyDescription && (
                    <p className="avviso__desc muted text-sm">{r.studyDescription}</p>
                  )}
                </div>
                <div className="avviso__actions">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/studi/${r.studyId}`)}
                  >
                    Visualizza
                  </Button>
                  <Button size="sm" onClick={() => approve(r)}>
                    Approva
                  </Button>
                </div>
              </Card>
            ))}

          {/* Sharing requests are not yet wired to the backend. */}
          {(tab === "condivisioni" || (tab === "tutti" && approvals.length === 0)) && (
            <EmptyState
              icon="bell"
              title={tab === "condivisioni" ? "Nessuna condivisione" : "Nessun avviso"}
              subtitle={
                tab === "condivisioni"
                  ? "Le richieste di condivisione appariranno qui."
                  : "Le richieste di approvazione e condivisione appariranno qui."
              }
            />
          )}

          {tab === "approvazioni" && approvals.length === 0 && (
            <EmptyState
              icon="clipboard-check"
              title="Nessuna approvazione in sospeso"
              subtitle="Le richieste di attivazione dei ricercatori appariranno qui."
            />
          )}
        </div>
      )}

      <FeedbackModal
        open={!!done}
        variant="success"
        title="Studio approvato"
        message={`Lo studio "${done}" è stato attivato.`}
        onClose={() => setDone(null)}
      />
    </div>
  );
}
