import { useState } from "react";
import { Table, EmptyState, Modal, Button, Input, ConfirmDialog } from "../../../components/ui";
import { FileUpload } from "../../../components/shared/FileUpload";
import { SectionHeader, ComeProcedere } from "../SectionChrome";
import { useEditStudy } from "../useEditStudy";
import type { InstructionDocument } from "../../../data/types";

export function EditIstruzioni() {
  const { study, update } = useEditStudy();
  const [adding, setAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  if (!study) return null;

  const addDoc = (fileName: string) => {
    const doc: InstructionDocument = {
      id: `i-${Date.now()}`,
      title: title || "Istruzioni partecipanti",
      fileName,
    };
    update({ instructions: [...study.instructions, doc] });
    setTitle("");
    setAdding(false);
  };

  return (
    <div>
      <SectionHeader title="Istruzioni" onAdd={() => setAdding(true)} />

      <ComeProcedere>
        In questa sezione puoi aggiungere le istruzioni per guidare i partecipanti durante lo
        svolgimento dello studio.
      </ComeProcedere>

      {study.instructions.length === 0 ? (
        <EmptyState icon="list-check" title="Nessuna istruzione" subtitle="Aggiungi un documento con il pulsante in alto." />
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Titolo</th>
              <th style={{ textAlign: "right" }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {study.instructions.map((i) => (
              <tr key={i.id}>
                <td style={{ fontWeight: 500 }}>{i.title}</td>
                <td>
                  <div className="cell-actions">
                    <button className="icon-btn" aria-label="Modifica"><i className="bi bi-pencil-square" aria-hidden /></button>
                    <button className="icon-btn icon-btn--danger" aria-label="Elimina" onClick={() => setDeleteId(i.id)}>
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
        title="Nuove istruzioni"
        footer={<Button variant="base" onClick={() => setAdding(false)}>Chiudi</Button>}
      >
        <div className="stack">
          <Input label="Titolo" placeholder="Istruzioni partecipanti" value={title} onChange={(e) => setTitle(e.target.value)} />
          <FileUpload onFile={addDoc} />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && update({ instructions: study.instructions.filter((i) => i.id !== deleteId) })}
        title="Eliminare le istruzioni?"
        message="Se decidi di procedere l'elemento verrà eliminato definitivamente."
      />
    </div>
  );
}
