import { useState } from "react";
import { Button, Input, Textarea, FeedbackModal } from "../../../components/ui";
import { useEditStudy } from "../useEditStudy";
import { useStudies } from "../../../context/StudiesContext";

export function EditDettagli() {
  const { id, study, update } = useEditStudy();
  const { persistStudyDetails } = useStudies();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!study) return null;

  const onSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (id) await persistStudyDetails(id);
      setSaved(true);
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
          value={study.title}
          onChange={(e) => update({ title: e.target.value })}
        />
        <Textarea
          id="description"
          label="Descrizione"
          value={study.description}
          onChange={(e) => update({ description: e.target.value })}
        />
      </div>

      {error && (
        <p className="text-sm" style={{ color: "var(--color-danger)", marginTop: "var(--space-3)" }}>
          <i className="bi bi-exclamation-circle" aria-hidden /> {error}
        </p>
      )}

      <div className="wizard__footer" style={{ justifyContent: "flex-end" }}>
        <Button onClick={onSave} disabled={!study.title.trim() || saving}>
          {saving ? "Salvataggio…" : "Salva"}
        </Button>
      </div>

      <FeedbackModal
        open={saved}
        variant="success"
        title="Modifiche salvate"
        message="I dettagli dello studio sono stati aggiornati."
        onClose={() => setSaved(false)}
      />
    </div>
  );
}
