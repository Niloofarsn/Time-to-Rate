import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  ComplianceBadge,
  FeedbackModal,
  StatusBadge,
  Table,
  EmptyState,
} from "../../components/ui";
import { ShareModal } from "../../components/shared/ShareModal";
import { ComplianceChart } from "./ComplianceChart";
import { StudyCalendar } from "./StudyCalendar";
import { InviteModal } from "./InviteModal";
import { useStudies } from "../../context/StudiesContext";
import { formatDate } from "../../lib/format";
import { fetchParticipants, type StudyParticipant } from "../../lib/participantsApi";
import { isBackendId } from "../../lib/studiesApi";
import "./StudyDashboard.css";

const TABLE_LIMIT = 100;

export function StudyDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getStudy } = useStudies();
  const study = id ? getStudy(id) : undefined;

  const [invite, setInvite] = useState(false);
  const [share, setShare] = useState(false);
  const [sent, setSent] = useState(false);

  const [participants, setParticipants] = useState<StudyParticipant[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingP, setLoadingP] = useState(false);

  useEffect(() => {
    if (!id || !isBackendId(id)) return;
    setLoadingP(true);
    fetchParticipants(id)
      .then(({ participants, total }) => {
        setParticipants(participants);
        setTotal(total);
      })
      .catch(() => {
        setParticipants([]);
        setTotal(0);
      })
      .finally(() => setLoadingP(false));
  }, [id]);

  if (!study) {
    return (
      <div className="container page">
        <EmptyState icon="folder-x" title="Studio non trovato" />
      </div>
    );
  }

  const visible = participants.slice(0, TABLE_LIMIT);

  return (
    <div className="container page">
      <nav className="wizard__breadcrumb text-sm">
        <Link to="/studi">I miei studi</Link>
        <i className="bi bi-chevron-right" aria-hidden />
        <span>{study.title}</span>
      </nav>

      <div className="page-header">
        <h2>{study.title}</h2>
        <div className="row">
          <Button variant="base" icon="pencil-square" onClick={() => navigate(`/studi/${study.id}/modifica/dettagli`)}>
            Modifica
          </Button>
          <Button variant="base" icon="share" onClick={() => setShare(true)}>
            Condividi
          </Button>
        </div>
      </div>

      {/* Meta strip */}
      <Card className="dash__meta">
        <div className="dash__meta-item">
          <span className="dash__meta-label muted">Stato</span>
          <StatusBadge status={study.status} />
        </div>
        <div className="dash__meta-item">
          <span className="dash__meta-label muted">PI di riferimento</span>
          <span>{study.piName}</span>
        </div>
        <div className="dash__meta-item">
          <span className="dash__meta-label muted">Codice dello studio</span>
          <span>{study.code}</span>
        </div>
        <div className="dash__meta-item">
          <span className="dash__meta-label muted">Totale partecipanti</span>
          <span>{loadingP ? "…" : total}</span>
        </div>
      </Card>

      {/* Calendar + compliance */}
      <div className="dash__grid">
        <Card>
          <StudyCalendar study={study} />
        </Card>
        <Card>
          <h6 className="dash__card-title">Compliance dei partecipanti</h6>
          {loadingP ? (
            <EmptyState icon="hourglass-split" title="Caricamento…" />
          ) : participants.length === 0 ? (
            <EmptyState icon="bar-chart" title="Nessun dato" subtitle="Nessun partecipante iscritto a questo studio." />
          ) : (
            <>
              <ComplianceChart participants={participants} />
              <p className="muted text-xs" style={{ textAlign: "center", marginTop: "var(--space-2)" }}>
                Compliance relativa al partecipante più attivo dello studio.
              </p>
            </>
          )}
        </Card>
      </div>

      {/* Participants */}
      <div className="dash__participants-head">
        <h5>Partecipanti allo studio</h5>
        <Button icon="plus-lg" onClick={() => setInvite(true)}>
          Aggiungi
        </Button>
      </div>

      {loadingP ? (
        <Card>
          <p className="muted text-sm">
            <i className="bi bi-arrow-repeat" aria-hidden /> Caricamento dei partecipanti…
          </p>
        </Card>
      ) : participants.length === 0 ? (
        <Card padded={false}>
          <EmptyState icon="people" title="Nessun partecipante" subtitle="Nessuno si è ancora iscritto a questo studio." />
        </Card>
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <th>Partecipante</th>
                <th>Email</th>
                <th>Compliance</th>
                <th>Risposte</th>
                <th>Ultima risposta</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr key={p.id}>
                  <td className="dash__participant-name">{p.name}</td>
                  <td>{p.email}</td>
                  <td>
                    <ComplianceBadge level={p.compliance} />
                  </td>
                  <td>{p.respondedCount}</td>
                  <td>{formatDate(p.lastResponse)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          {total > TABLE_LIMIT && (
            <p className="muted text-sm" style={{ marginTop: "var(--space-2)" }}>
              Mostrati i primi {TABLE_LIMIT} di {total} partecipanti.
            </p>
          )}
        </>
      )}

      {/* Modals */}
      <InviteModal
        study={study}
        open={invite}
        onClose={() => setInvite(false)}
        onSent={() => {
          setInvite(false);
          setSent(true);
        }}
      />
      <ShareModal study={study} open={share} onClose={() => setShare(false)} />
      <FeedbackModal
        open={sent}
        variant="success"
        title="Invito inoltrato"
        message="I partecipanti sono stati correttamente invitati allo studio."
        actionLabel="Torna allo studio"
        onClose={() => setSent(false)}
      />
    </div>
  );
}
