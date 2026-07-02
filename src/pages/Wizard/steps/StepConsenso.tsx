import { useState } from "react";
import { Input, EmptyState } from "../../../components/ui";
import { FileUpload } from "../../../components/shared/FileUpload";
import { StepFooter } from "../StepFooter";
import { useWizardStudy } from "../useWizardStudy";
import type { ConsentDocument } from "../../../data/types";

export function StepConsenso() {
  const { study, update, goNext, goPrev } = useWizardStudy("consenso");
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
  };

  const remove = (id: string) => update({ consent: study.consent.filter((c) => c.id !== id) });

  return (
    <div>
      <div className="wizard__heading">
        <h4 className="wizard__title">Consenso informato</h4>
        <p className="muted text-sm">
          Carica il documento di consenso che i partecipanti dovranno accettare.
        </p>
      </div>

      <div className="wizard__form">
        <Input label="Titolo del documento" placeholder="Consenso informato" value={title} onChange={(e) => setTitle(e.target.value)} />
        <FileUpload onFile={addDoc} />
      </div>

      <h6 style={{ margin: "var(--space-4) 0 var(--space-2)" }}>Documenti caricati</h6>
      {study.consent.length === 0 ? (
        <EmptyState icon="file-earmark-check" title="Nessun documento" subtitle="Il consenso è facoltativo ma consigliato." />
      ) : (
        <div className="item-list">
          {study.consent.map((c) => (
            <div key={c.id} className="item-row">
              <span className="item-row__icon">
                <i className="bi bi-file-earmark-text" aria-hidden />
              </span>
              <div className="item-row__body">
                <p className="item-row__title">{c.title}</p>
                <p className="item-row__meta">{c.fileName}</p>
              </div>
              <button className="icon-btn icon-btn--danger" aria-label="Rimuovi" onClick={() => remove(c.id)}>
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
