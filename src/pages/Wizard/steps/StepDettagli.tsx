import { Input, Textarea } from "../../../components/ui";
import { StepFooter } from "../StepFooter";
import { useWizardStudy } from "../useWizardStudy";

export function StepDettagli() {
  const { study, update, goNext } = useWizardStudy("dettagli");
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

      <StepFooter showPrev={false} onNext={goNext} nextDisabled={!study.title.trim()} />
    </div>
  );
}
