import { useState } from "react";
import { Button, Input, Textarea, FeedbackModal } from "../../../components/ui";
import { useEditStudy } from "../useEditStudy";

export function EditDettagli() {
  const { study, update } = useEditStudy();
  const [saved, setSaved] = useState(false);
  if (!study) return null;

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

      <div className="wizard__footer" style={{ justifyContent: "flex-end" }}>
        <Button onClick={() => setSaved(true)} disabled={!study.title.trim()}>
          Salva
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
