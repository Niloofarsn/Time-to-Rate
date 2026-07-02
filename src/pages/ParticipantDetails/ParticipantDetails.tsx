import { Link, useParams } from "react-router-dom";
import { Card, ComplianceBadge, EmptyState, Table } from "../../components/ui";
import { useStudies } from "../../context/StudiesContext";
import { formatDate, initials } from "../../lib/format";
import "./ParticipantDetails.css";

export function ParticipantDetails() {
  const { id, pid } = useParams();
  const { getStudy } = useStudies();
  const study = id ? getStudy(id) : undefined;
  const participant = study?.participants.find((p) => p.id === pid);

  if (!study || !participant) {
    return (
      <div className="container page">
        <EmptyState icon="person-x" title="Partecipante non trovato" />
      </div>
    );
  }

  const groupName = study.groups.find((g) => g.id === participant.groupId)?.name ?? "—";

  // Mock response history
  const history = Array.from({ length: 6 }).map((_, i) => {
    const day = 30 - i;
    const responded = participant.compliancePct > 0 && (i + (participant.compliancePct % 3)) % 3 !== 0;
    return {
      date: `2026-10-${String(day).padStart(2, "0")}`,
      window: ["09:00–11:00", "13:00–15:00", "17:00–19:00"][i % 3],
      responded,
    };
  });

  return (
    <div className="container page">
      <nav className="wizard__breadcrumb text-sm">
        <Link to="/studi">I miei studi</Link>
        <i className="bi bi-chevron-right" aria-hidden />
        <Link to={`/studi/${study.id}`}>{study.title}</Link>
        <i className="bi bi-chevron-right" aria-hidden />
        <span>{participant.name}</span>
      </nav>

      <div className="pdet__head">
        <span className="pdet__avatar">{initials(participant.name)}</span>
        <div>
          <h3>{participant.name}</h3>
          <p className="muted">{participant.email}</p>
        </div>
      </div>

      <div className="pdet__stats">
        <Card className="pdet__stat">
          <span className="pdet__stat-label muted">Compliance</span>
          <div className="row">
            <ComplianceBadge level={participant.compliance} />
            <strong>{participant.compliancePct}%</strong>
          </div>
        </Card>
        <Card className="pdet__stat">
          <span className="pdet__stat-label muted">Condizione</span>
          <span>{groupName}</span>
        </Card>
        <Card className="pdet__stat">
          <span className="pdet__stat-label muted">Ultima risposta</span>
          <span>{formatDate(participant.lastResponse)}</span>
        </Card>
        <Card className="pdet__stat">
          <span className="pdet__stat-label muted">Stato</span>
          <span style={{ textTransform: "capitalize" }}>{participant.status}</span>
        </Card>
      </div>

      <h5 className="pdet__section-title">Storico delle risposte</h5>
      <Table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Finestra</th>
            <th>Esito</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h, i) => (
            <tr key={i}>
              <td>{formatDate(h.date)}</td>
              <td>{h.window}</td>
              <td>
                {h.responded ? (
                  <span className="pdet__ok">
                    <i className="bi bi-check-circle-fill" aria-hidden /> Risposto
                  </span>
                ) : (
                  <span className="pdet__miss">
                    <i className="bi bi-x-circle" aria-hidden /> Mancato
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
