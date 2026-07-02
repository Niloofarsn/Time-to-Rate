import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  ComplianceBadge,
  ConfirmDialog,
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
import type { Participant } from "../../data/types";
import "./StudyDashboard.css";

export function StudyDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getStudy, removeParticipant } = useStudies();
  const study = id ? getStudy(id) : undefined;

  const [invite, setInvite] = useState(false);
  const [share, setShare] = useState(false);
  const [sent, setSent] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Participant | null>(null);

  if (!study) {
    return (
      <div className="container page">
        <EmptyState icon="folder-x" title="Studio non trovato" />
      </div>
    );
  }

  const groupName = (gid: string) => study.groups.find((g) => g.id === gid)?.name ?? "—";

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
          <Button variant="base" icon="pencil-square" onClick={() => navigate(`/studi/${study.id}/crea/dettagli`)}>
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
          <span>{study.participants.length}</span>
        </div>
      </Card>

      {/* Calendar + compliance */}
      <div className="dash__grid">
        <Card>
          <StudyCalendar study={study} />
        </Card>
        <Card>
          <h6 className="dash__card-title">Compliance dei partecipanti</h6>
          {study.participants.length === 0 ? (
            <EmptyState icon="bar-chart" title="Nessun dato" subtitle="Invita partecipanti per vedere la compliance." />
          ) : (
            <ComplianceChart participants={study.participants} />
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

      {study.participants.length === 0 ? (
        <Card padded={false}>
          <EmptyState icon="people" title="Nessun partecipante" subtitle="Aggiungi partecipanti per iniziare a raccogliere dati." />
        </Card>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Nome partecipante</th>
              <th>Compliance</th>
              <th>Condizione</th>
              <th>Ultima risposta</th>
              <th className="dash__actions-col">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {study.participants.map((p) => (
              <tr key={p.id}>
                <td className="dash__participant-name">{p.name}</td>
                <td>
                  <ComplianceBadge level={p.compliance} />
                </td>
                <td>{groupName(p.groupId)}</td>
                <td>{formatDate(p.lastResponse)}</td>
                <td>
                  <div className="cell-actions">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/studi/${study.id}/partecipanti/${p.id}`)}
                    >
                      Dettagli
                    </Button>
                    <button
                      className="icon-btn icon-btn--danger"
                      aria-label="Rimuovi"
                      onClick={() => setRemoveTarget(p)}
                    >
                      <i className="bi bi-trash" aria-hidden />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
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
      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => removeTarget && removeParticipant(study.id, removeTarget.id)}
        title={`Eliminare "${removeTarget?.name}" dallo studio?`}
        message="Se decidi di procedere il partecipante verrà rimosso definitivamente."
      />
    </div>
  );
}
