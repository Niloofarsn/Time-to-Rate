import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Textarea } from "../../../components/ui";
import { StepFooter } from "../StepFooter";
import { useWizardStudy } from "../useWizardStudy";
import { useStudies } from "../../../context/StudiesContext";
import { isBackendId } from "../../../lib/studiesApi";

export function StepDettagli() {
  const navigate = useNavigate();
  const { id, study, update } = useWizardStudy("dettagli");
  const { createStudy, deleteStudy, persistStudyDetails } = useStudies();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!study || !id) return null;

  // On "Prosegui": create the backend study (first time) or persist edits, then continue.
  const onNext = async () => {
    setSaving(true);
    setError(null);
    try {
      if (isBackendId(id)) {
        await persistStudyDetails(id);
        navigate(`/studi/${id}/crea/pianificazioni`);
      } else {
        // Local draft → create the real study on the backend, drop the draft.
        const created = await createStudy(study.title.trim(), study.description.trim());
        deleteStudy(id);
        navigate(`/studi/${created.id}/crea/pianificazioni`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Salvataggio non riuscito");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="wizard__heading">
        <h4 className="wizard__title">Dettagli</h4>
        <p className="muted text-sm">Titolo e descrizione dello studio.</p>
      </div>

      <div className="wizard__form">
        <Input
          id="title"
          label="Titolo"
          required
          placeholder="Titolo dello studio"
          value={study.title}
          onChange={(e) => update({ title: e.target.value })}
        />
        <Textarea
          id="description"
          label="Descrizione"
          placeholder="Anche solo una frase per aiutare i partecipanti a capire di cosa si tratta e a cosa serve lo studio."
          value={study.description}
          onChange={(e) => update({ description: e.target.value })}
        />
      </div>

      {error && (
        <p className="text-sm" style={{ color: "var(--color-danger)", marginTop: "var(--space-3)" }}>
          <i className="bi bi-exclamation-circle" aria-hidden /> {error}
        </p>
      )}

      <StepFooter
        showPrev={false}
        onNext={onNext}
        nextLabel={saving ? "Salvataggio…" : "Prosegui"}
        nextDisabled={!study.title.trim() || saving}
      />
    </div>
  );
}
