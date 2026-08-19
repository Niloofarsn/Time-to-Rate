import { useState } from "react";
import { Table, EmptyState, Modal, Button, Input, ConfirmDialog } from "../../../components/ui";
import { FileUpload } from "../../../components/shared/FileUpload";
import { SectionHeader, ComeProcedere } from "../SectionChrome";
import { useEditStudy } from "../useEditStudy";
import type { ConsentDocument } from "../../../data/types";

export function EditConsenso() {
  const { study, update } = useEditStudy();
  const [adding, setAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  if (!study) return null;

  const addDoc = (fileName: string) => {
    const doc: ConsentDocument = {
      id: `c-${Date.now()}`,
      title: title || "Consenso informato",
      type: "Consenso informato",
      fileName,
    };
    update({ consent: [...study.consent, doc] });
    setTitle("");
    setAdding(false);
  };

  return (
    <div>
      <SectionHeader title="Consenso informato" onAdd={() => setAdding(true)} />

      <ComeProcedere>
        In questa sezione puoi aggiungere i moduli di consenso informato e privacy che i
        partecipanti dovranno accettare prima di iniziare lo studio.
      </ComeProcedere>

      {study.consent.length === 0 ? (
        <EmptyState icon="file-earmark-check" title="Nessun documento" subtitle="Aggiungi un documento con il pulsante in alto." />
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Titolo</th>
              <th>Tipo</th>
              <th style={{ textAlign: "right" }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {study.consent.map((c) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 500 }}>{c.title}</td>
                <td>{c.type}</td>
                <td>
                  <div className="cell-actions">
                    <button className="icon-btn" aria-label="Modifica"><i className="bi bi-pencil-square" aria-hidden /></button>
                    <button className="icon-btn icon-btn--danger" aria-label="Elimina" onClick={() => setDeleteId(c.id)}>
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
        title="Nuovo documento di consenso"
        footer={<Button variant="base" onClick={() => setAdding(false)}>Chiudi</Button>}
      >
        <div className="stack">
          <Input label="Titolo del documento" placeholder="Consenso informato" value={title} onChange={(e) => setTitle(e.target.value)} />
          <FileUpload onFile={addDoc} />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && update({ consent: study.consent.filter((c) => c.id !== deleteId) })}
        title="Eliminare il documento?"
        message="Se decidi di procedere l'elemento verrà eliminato definitivamente."
      />
    </div>
  );
}
