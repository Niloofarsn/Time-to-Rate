import { useState } from "react";
import { Button, Input, Textarea, Select, EmptyState } from "../../../components/ui";
import { StepFooter } from "../StepFooter";
import { useWizardStudy } from "../useWizardStudy";
import type { StudyNotification } from "../../../data/types";

export function StepNotifiche() {
  const { study, update, goNext, goPrev } = useWizardStudy("notifiche");
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState("Tutti");

  if (!study) return null;

  const save = () => {
    const notif: StudyNotification = {
      id: `n-${Date.now()}`,
      title: title || "Nuova notifica",
      body,
      recipients,
      trigger: "Inizio finestra",
    };
    update({ notifications: [...study.notifications, notif] });
    setTitle("");
    setBody("");
    setAdding(false);
  };

  const remove = (id: string) =>
    update({ notifications: study.notifications.filter((n) => n.id !== id) });

  return (
    <div>
      <div className="wizard__heading">
        <h4 className="wizard__title">Notifiche</h4>
        <p className="muted text-sm">
          Messaggi che i partecipanti riceveranno per ricordare loro di rispondere.
        </p>
      </div>

      {study.notifications.length === 0 && !adding ? (
        <EmptyState icon="bell" title="Nessuna notifica" subtitle="Le notifiche sono facoltative." />
      ) : (
        <div className="item-list">
          {study.notifications.map((n) => (
            <div key={n.id} className="item-row">
              <span className="item-row__icon">
                <i className="bi bi-bell" aria-hidden />
              </span>
              <div className="item-row__body">
                <p className="item-row__title">{n.title}</p>
                <p className="item-row__meta">
                  {n.body} · Destinatari: {n.recipients}
                </p>
              </div>
              <button className="icon-btn icon-btn--danger" aria-label="Rimuovi" onClick={() => remove(n.id)}>
                <i className="bi bi-trash" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <div className="wizard__form" style={{ marginTop: "var(--space-3)" }}>
          <Input label="Titolo" placeholder="Titolo della notifica" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea label="Testo" placeholder="Testo della notifica" value={body} onChange={(e) => setBody(e.target.value)} />
          <Select
            label="Destinatari"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            options={[
              { value: "Tutti", label: "Tutti" },
              ...study.groups.map((g) => ({ value: g.name, label: g.name })),
            ]}
          />
          <div className="row">
            <Button onClick={save}>Salva notifica</Button>
            <Button variant="base" onClick={() => setAdding(false)}>
              Annulla
            </Button>
          </div>
        </div>
      )}

      {!adding && (
        <Button variant="outline" icon="plus-lg" onClick={() => setAdding(true)} style={{ marginTop: "var(--space-3)" }}>
          Aggiungi notifica
        </Button>
      )}

      <StepFooter onPrev={goPrev} onNext={goNext} />
    </div>
  );
}
