import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  ConfirmDialog,
  Dropdown,
  Input,
  Modal,
  StatusBadge,
  Table,
  Tabs,
  Textarea,
} from "../../components/ui";
import { ShareModal } from "../../components/shared/ShareModal";
import { useStudies } from "../../context/StudiesContext";
import { useAuth } from "../../context/AuthContext";
import type { Study } from "../../data/types";
import { formatDateRange } from "../../lib/format";
import "./StudiesPage.css";

type Filter = "tutti" | "attivo" | "bozza" | "completato";

export function StudiesPage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";
  const { studies, loading, error, createStudy, duplicateStudy, deleteStudy } = useStudies();
  const [filter, setFilter] = useState<Filter>("tutti");
  const [shareStudy, setShareStudy] = useState<Study | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Study | null>(null);

  // New-study modal (persists to the backend on create)
  const [newOpen, setNewOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const activeStudies = studies.filter((s) => s.status === "attivo");

  const filtered = useMemo(
    () => (filter === "tutti" ? studies : studies.filter((s) => s.status === filter)),
    [studies, filter],
  );

  const submitNewStudy = async () => {
    setCreating(true);
    setCreateError(null);
    try {
      const study = await createStudy(newTitle.trim(), newDesc.trim());
      setNewOpen(false);
      setNewTitle("");
      setNewDesc("");
      navigate(`/studi/${study.id}/modifica/dettagli`);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Creazione non riuscita");
    } finally {
      setCreating(false);
    }
  };

  // Drafts continue in the creation wizard; active/completed studies open the edit view.
  const editStudy = (s: Study) =>
    navigate(
      s.status === "bozza"
        ? `/studi/${s.id}/crea/dettagli`
        : `/studi/${s.id}/modifica/dettagli`,
    );
  const openStudy = (s: Study) =>
    s.status === "bozza" ? editStudy(s) : navigate(`/studi/${s.id}`);

  return (
    <div className="container page">
      <div className="page-header">
        <h2>{isAdmin ? "Tutti gli studi" : "I miei studi"}</h2>
        <Button icon="plus-lg" onClick={() => setNewOpen(true)}>
          Aggiungi
        </Button>
      </div>

      {loading && (
        <p className="muted text-sm" style={{ marginBottom: "var(--space-3)" }}>
          <i className="bi bi-arrow-repeat" aria-hidden /> Caricamento degli studi dal server…
        </p>
      )}
      {error && (
        <p
          className="text-sm"
          style={{
            marginBottom: "var(--space-3)",
            color: "var(--color-danger)",
            background: "var(--soft-red-bg)",
            padding: "8px 12px",
            borderRadius: "var(--radius-control)",
          }}
        >
          <i className="bi bi-exclamation-circle" aria-hidden /> {error}
        </p>
      )}

      {/* Active studies cards */}
      <section className="studies__section">
        <h5 className="studies__section-title">Studi attivi</h5>
        {activeStudies.length === 0 ? (
          <Card>
            <p className="muted">Nessuno studio attivo al momento.</p>
          </Card>
        ) : (
          <div className="studies__cards">
            {activeStudies.map((s) => (
              <Card key={s.id} className="study-card">
                <div className="study-card__head">
                  <h6 className="study-card__title">{s.title}</h6>
                  <div className="row">
                    <StatusBadge status={s.status} />
                    <Dropdown
                      trigger={
                        <button className="icon-btn" aria-label="Azioni">
                          <i className="bi bi-three-dots-vertical" aria-hidden />
                        </button>
                      }
                      items={[
                        { label: "Modifica", icon: "pencil", onClick: () => editStudy(s) },
                        { label: "Duplica", icon: "files", onClick: () => duplicateStudy(s.id) },
                        { label: "Condividi", icon: "share", onClick: () => setShareStudy(s) },
                        { label: "Elimina", icon: "trash", danger: true, onClick: () => setDeleteTarget(s) },
                      ]}
                    />
                  </div>
                </div>
                <p className="study-card__date muted text-sm">
                  {formatDateRange(s.startDate, s.endDate)}
                </p>
                <p className="study-card__desc text-sm">{s.description}</p>
                <div className="study-card__foot">
                  <Button
                    variant="outline"
                    size="sm"
                    icon="arrow-right"
                    aria-label={`Apri ${s.title}`}
                    onClick={() => openStudy(s)}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* All studies table */}
      <section className="studies__section">
        <h5 className="studies__section-title">Tutti gli studi</h5>
        <div className="studies__tabs">
          <Tabs<Filter>
            active={filter}
            onChange={setFilter}
            tabs={[
              { value: "tutti", label: "Tutti" },
              { value: "attivo", label: "Attivi" },
              { value: "bozza", label: "Bozze" },
              { value: "completato", label: "Completati" },
            ]}
          />
        </div>

        <Table>
          <thead>
            <tr>
              <th>Nome dello studio</th>
              <th>Start date → End date</th>
              <th>PI di riferimento</th>
              {isAdmin && <th>Creato da</th>}
              <th>Codice dello studio</th>
              <th>Stato dello studio</th>
              <th className="studies__actions-col">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="studies__row" onClick={() => openStudy(s)}>
                <td className="studies__name">{s.title}</td>
                <td>{formatDateRange(s.startDate, s.endDate)}</td>
                <td>PI: {s.piName}</td>
                {isAdmin && <td>{s.createdBy ?? "—"}</td>}
                <td>{s.code}</td>
                <td>
                  <StatusBadge status={s.status} />
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="cell-actions">
                    <button className="icon-btn" aria-label="Modifica" onClick={() => editStudy(s)}>
                      <i className="bi bi-pencil-square" aria-hidden />
                    </button>
                    <button className="icon-btn" aria-label="Duplica" onClick={() => duplicateStudy(s.id)}>
                      <i className="bi bi-files" aria-hidden />
                    </button>
                    <button className="icon-btn" aria-label="Condividi" onClick={() => setShareStudy(s)}>
                      <i className="bi bi-share" aria-hidden />
                    </button>
                    <button
                      className="icon-btn icon-btn--danger"
                      aria-label="Elimina"
                      onClick={() => setDeleteTarget(s)}
                    >
                      <i className="bi bi-trash" aria-hidden />
                    </button>
                    <button
                      className="icon-btn icon-btn--primary"
                      aria-label="Apri"
                      onClick={() => openStudy(s)}
                    >
                      <i className="bi bi-arrow-right" aria-hidden />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>

      {shareStudy && (
        <ShareModal study={shareStudy} open onClose={() => setShareStudy(null)} />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteStudy(deleteTarget.id)}
        title={`Eliminare "${deleteTarget?.title}"?`}
        message="Se decidi di procedere l'elemento verrà eliminato definitivamente."
      />

      <Modal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        title="Nuovo studio"
        footer={
          <>
            <Button variant="base" onClick={() => setNewOpen(false)}>
              Annulla
            </Button>
            <Button onClick={submitNewStudy} disabled={!newTitle.trim() || creating}>
              {creating ? "Creazione…" : "Crea studio"}
            </Button>
          </>
        }
      >
        <div className="stack">
          <Input
            label="Titolo"
            required
            placeholder="Titolo dello studio"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <Textarea
            label="Descrizione"
            placeholder="Breve descrizione dello studio."
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />
          {createError && (
            <p className="text-sm" style={{ color: "var(--color-danger)" }}>
              <i className="bi bi-exclamation-circle" aria-hidden /> {createError}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
