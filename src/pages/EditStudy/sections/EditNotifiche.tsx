import { useState } from "react";
import { Table, EmptyState, Modal, Button, Input, Textarea, Select, ConfirmDialog } from "../../../components/ui";
import { SectionHeader, ComeProcedere } from "../SectionChrome";
import { useEditStudy } from "../useEditStudy";
import type { StudyNotification } from "../../../data/types";

export function EditNotifiche() {
  const { study, update } = useEditStudy();
  const [adding, setAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState("Tutti");

  if (!study) return null;

  const save = () => {
    const n: StudyNotification = {
      id: `n-${Date.now()}`,
      title: title || "Nuova notifica",
      body,
      recipients,
      trigger: "Inizio finestra",
    };
    update({ notifications: [...study.notifications, n] });
    setTitle("");
    setBody("");
    setAdding(false);
  };

  return (
    <div>
      <SectionHeader title="Notifiche" onAdd={() => setAdding(true)} />

      <ComeProcedere>
        In questa sezione puoi aggiungere le notifiche che ricordano ai partecipanti di
        compilare i questionari. Ogni notifica deve essere associata a una pianificazione.
      </ComeProcedere>

      {study.notifications.length === 0 ? (
        <EmptyState icon="bell" title="Nessuna notifica" subtitle="Le notifiche sono facoltative." />
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Titolo</th>
              <th>Testo</th>
              <th>Destinatari</th>
              <th style={{ textAlign: "right" }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {study.notifications.map((n) => (
              <tr key={n.id}>
                <td style={{ fontWeight: 500 }}>{n.title}</td>
                <td style={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.body}</td>
                <td>{n.recipients}</td>
                <td>
                  <div className="cell-actions">
                    <button className="icon-btn" aria-label="Modifica"><i className="bi bi-pencil-square" aria-hidden /></button>
                    <button className="icon-btn icon-btn--danger" aria-label="Elimina" onClick={() => setDeleteId(n.id)}>
                      <i className="bi bi-trash" aria-hidden />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="Nuova notifica"
        footer={
          <>
            <Button variant="base" onClick={() => setAdding(false)}>Annulla</Button>
            <Button onClick={save}>Salva</Button>
          </>
        }
      >
        <div className="stack">
          <Input label="Titolo" placeholder="Titolo della notifica" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea label="Testo" placeholder="Testo della notifica" value={body} onChange={(e) => setBody(e.target.value)} />
          <Select
            label="Destinatari"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            options={[{ value: "Tutti", label: "Tutti" }, ...study.groups.map((g) => ({ value: g.name, label: g.name }))]}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && update({ notifications: study.notifications.filter((n) => n.id !== deleteId) })}
        title="Eliminare la notifica?"
        message="Se decidi di procedere l'elemento verrà eliminato definitivamente."
      />
    </div>
  );
}
