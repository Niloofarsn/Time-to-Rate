import { useState } from "react";
import { Input, EmptyState } from "../../../components/ui";
import { FileUpload } from "../../../components/shared/FileUpload";
import { StepFooter } from "../StepFooter";
import { useWizardStudy } from "../useWizardStudy";
import type { InstructionDocument } from "../../../data/types";

export function StepIstruzioni() {
  const { study, update, goNext, goPrev } = useWizardStudy("istruzioni");
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
  };

  const remove = (id: string) =>
    update({ instructions: study.instructions.filter((i) => i.id !== id) });

  return (
    <div>
      <div className="wizard__heading">
        <h4 className="wizard__title">Istruzioni</h4>
        <p className="muted text-sm">
          Documenti e indicazioni per guidare i partecipanti durante lo studio.
        </p>
      </div>

      <div className="wizard__form">
        <Input label="Titolo" placeholder="Istruzioni partecipanti" value={title} onChange={(e) => setTitle(e.target.value)} />
        <FileUpload onFile={addDoc} />
      </div>

      <h6 style={{ margin: "var(--space-4) 0 var(--space-2)" }}>Documenti caricati</h6>
      {study.instructions.length === 0 ? (
        <EmptyState icon="list-check" title="Nessuna istruzione" subtitle="Le istruzioni sono facoltative." />
      ) : (
        <div className="item-list">
          {study.instructions.map((i) => (
            <div key={i.id} className="item-row">
              <span className="item-row__icon">
                <i className="bi bi-file-earmark-text" aria-hidden />
              </span>
              <div className="item-row__body">
                <p className="item-row__title">{i.title}</p>
                <p className="item-row__meta">{i.fileName}</p>
              </div>
              <button className="icon-btn icon-btn--danger" aria-label="Rimuovi" onClick={() => remove(i.id)}>
                <i className="bi bi-trash" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      )}

      <StepFooter onPrev={goPrev} onNext={goNext} />
    </div>
  );
}
