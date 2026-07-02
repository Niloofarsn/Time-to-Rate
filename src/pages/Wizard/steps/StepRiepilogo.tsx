import { useState } from "react";
import { StepFooter } from "../StepFooter";
import { useWizardStudy } from "../useWizardStudy";

function SummarySection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="summary__item">
      <button className="summary__head" onClick={() => setOpen((v) => !v)}>
        {title}
        <i className={`bi bi-chevron-${open ? "up" : "down"}`} aria-hidden />
      </button>
      {open && <div className="summary__content">{children}</div>}
    </div>
  );
}

export function StepRiepilogo() {
  const { study, goNext, goPrev } = useWizardStudy("riepilogo");
  if (!study) return null;

  return (
    <div>
      <div className="wizard__heading">
        <h4 className="wizard__title">Riepilogo</h4>
        <p className="muted text-sm">Controlla tutte le informazioni prima di attivare lo studio.</p>
      </div>

      <div className="summary">
        <SummarySection title="Dettagli dello studio" defaultOpen>
          <dl>
            <dt>Titolo</dt>
            <dd>{study.title || "—"}</dd>
            <dt>Descrizione</dt>
            <dd>{study.description || "—"}</dd>
            <dt>PI di riferimento</dt>
            <dd>{study.piName}</dd>
            <dt>Codice</dt>
            <dd>{study.code}</dd>
          </dl>
        </SummarySection>

        <SummarySection title="Pianificazioni">
          {study.schedules.length === 0 ? (
            <p className="muted">Nessuna pianificazione.</p>
          ) : (
            <dl>
              {study.schedules.map((s, i) => (
                <div key={s.id} style={{ display: "contents" }}>
                  <dt>Pianificazione {i + 1}</dt>
                  <dd>
                    {s.type} ·{" "}
                    {s.mode === "numero-giorni" ? `${s.numberOfDays} giorni` : `${s.specificDates?.length} date`} ·{" "}
                    {s.windows.length} finestre
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </SummarySection>

        <SummarySection title="Notifiche">
          {study.notifications.length === 0 ? (
            <p className="muted">Nessuna notifica.</p>
          ) : (
            <dl>
              {study.notifications.map((n) => (
                <div key={n.id} style={{ display: "contents" }}>
                  <dt>{n.title}</dt>
                  <dd>{n.body}</dd>
                </div>
              ))}
            </dl>
          )}
        </SummarySection>

        <SummarySection title="Consenso informato">
          {study.consent.length === 0 ? (
            <p className="muted">Nessun documento.</p>
          ) : (
            <dl>
              {study.consent.map((c) => (
                <div key={c.id} style={{ display: "contents" }}>
                  <dt>{c.title}</dt>
                  <dd>{c.fileName}</dd>
                </div>
              ))}
            </dl>
          )}
        </SummarySection>

        <SummarySection title="Istruzioni">
          {study.instructions.length === 0 ? (
            <p className="muted">Nessuna istruzione.</p>
          ) : (
            <dl>
              {study.instructions.map((i) => (
                <div key={i.id} style={{ display: "contents" }}>
                  <dt>{i.title}</dt>
                  <dd>{i.fileName}</dd>
                </div>
              ))}
            </dl>
          )}
        </SummarySection>
      </div>

      <StepFooter onPrev={goPrev} onNext={goNext} nextLabel="Prosegui" />
    </div>
  );
}
