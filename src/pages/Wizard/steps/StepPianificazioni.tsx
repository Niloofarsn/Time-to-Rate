import { useState } from "react";
import { Button, Select, Input, Table, EmptyState } from "../../../components/ui";
import { StepFooter } from "../StepFooter";
import { useWizardStudy } from "../useWizardStudy";
import type { SamplingWindow, ScheduleMode, ScheduleRule, ScheduleType } from "../../../data/types";

export function StepPianificazioni() {
  const { study, update, goNext, goPrev } = useWizardStudy("pianificazioni");

  const [type, setType] = useState<ScheduleType>("time-contingent");
  const [mode, setMode] = useState<ScheduleMode>("numero-giorni");
  const [groupId, setGroupId] = useState(study?.groups[0]?.id ?? "");
  const [numberOfDays, setNumberOfDays] = useState(7);
  const [specificDates, setSpecificDates] = useState<string>("");
  const [windows, setWindows] = useState<SamplingWindow[]>([
    { id: `w-${Date.now()}`, label: "Finestra di campionamento", startTime: "10:00", endTime: "11:00" },
  ]);

  if (!study) return null;

  const addWindow = () =>
    setWindows((prev) => [
      ...prev,
      { id: `w-${Date.now()}`, label: "Finestra di campionamento", startTime: "12:00", endTime: "13:00" },
    ]);

  const updateWindow = (id: string, patch: Partial<SamplingWindow>) =>
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)));

  const removeWindow = (id: string) =>
    setWindows((prev) => prev.filter((w) => w.id !== id));

  const addSchedule = () => {
    const rule: ScheduleRule = {
      id: `sch-${Date.now()}`,
      groupId,
      type,
      mode,
      numberOfDays: mode === "numero-giorni" ? numberOfDays : undefined,
      specificDates:
        mode === "date-specifiche"
          ? specificDates.split(",").map((d) => d.trim()).filter(Boolean)
          : undefined,
      windows,
      promptsPerDay: windows.length,
    };
    update({ schedules: [...study.schedules, rule] });
  };

  const removeSchedule = (id: string) =>
    update({ schedules: study.schedules.filter((s) => s.id !== id) });

  const groupName = (id: string) => study.groups.find((g) => g.id === id)?.name ?? "—";

  return (
    <div>
      <div className="wizard__heading">
        <h4 className="wizard__title">Pianificazioni</h4>
        <p className="muted text-sm">
          Definisci quando i partecipanti riceveranno le richieste di risposta.
        </p>
      </div>

      <div className="wizard__section-note">
        Uno studio <strong>time-contingent</strong> invia le richieste a orari prestabiliti; uno{" "}
        <strong>event-contingent</strong> chiede al partecipante di rispondere al verificarsi di un
        evento.
      </div>

      <div className="wizard__form" style={{ maxWidth: "100%" }}>
        {/* Type */}
        <div className="field">
          <label className="field__label">Tipo di studio</label>
          <div className="segmented">
            <button
              className={`segmented__opt ${type === "time-contingent" ? "is-active" : ""}`}
              onClick={() => setType("time-contingent")}
            >
              Time-contingent
            </button>
            <button
              className={`segmented__opt ${type === "event-contingent" ? "is-active" : ""}`}
              onClick={() => setType("event-contingent")}
            >
              Event-contingent
            </button>
          </div>
        </div>

        <div className="row" style={{ gap: "var(--space-3)", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ minWidth: 220 }}>
            <Select
              label="Condizione / gruppo"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              options={study.groups.map((g) => ({ value: g.id, label: g.name }))}
            />
          </div>

          {/* Mode */}
          <div className="field">
            <label className="field__label">Durata</label>
            <div className="segmented">
              <button
                className={`segmented__opt ${mode === "numero-giorni" ? "is-active" : ""}`}
                onClick={() => setMode("numero-giorni")}
              >
                Numero di giorni
              </button>
              <button
                className={`segmented__opt ${mode === "date-specifiche" ? "is-active" : ""}`}
                onClick={() => setMode("date-specifiche")}
              >
                Date specifiche
              </button>
            </div>
          </div>

          {mode === "numero-giorni" ? (
            <div style={{ width: 140 }}>
              <Input
                type="number"
                min={1}
                label="Giorni"
                value={numberOfDays}
                onChange={(e) => setNumberOfDays(Number(e.target.value))}
              />
            </div>
          ) : (
            <div style={{ minWidth: 260 }}>
              <Input
                label="Date (separate da virgola)"
                placeholder="2026-05-05, 2026-05-08"
                value={specificDates}
                onChange={(e) => setSpecificDates(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Sampling windows — only relevant for time-contingent */}
        {type === "time-contingent" && (
          <div className="field">
            <label className="field__label">Finestre di campionamento</label>
            <div className="windows">
              {windows.map((w) => (
                <div key={w.id} className="window-row">
                  <span className="window-row__label">
                    <i className="bi bi-clock" aria-hidden /> {w.label}
                  </span>
                  <input
                    type="time"
                    className="control"
                    value={w.startTime}
                    onChange={(e) => updateWindow(w.id, { startTime: e.target.value })}
                  />
                  <input
                    type="time"
                    className="control"
                    value={w.endTime}
                    onChange={(e) => updateWindow(w.id, { endTime: e.target.value })}
                  />
                  <button
                    className="icon-btn icon-btn--danger"
                    aria-label="Rimuovi finestra"
                    onClick={() => removeWindow(w.id)}
                  >
                    <i className="bi bi-trash" aria-hidden />
                  </button>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" icon="plus-lg" onClick={addWindow} style={{ marginTop: 8 }}>
              Aggiungi finestra
            </Button>
          </div>
        )}

        <div>
          <Button icon="plus-lg" onClick={addSchedule}>
            Aggiungi pianificazione
          </Button>
        </div>
      </div>

      {/* Created schedules */}
      <h6 style={{ margin: "var(--space-4) 0 var(--space-2)" }}>Pianificazioni create</h6>
      {study.schedules.length === 0 ? (
        <EmptyState icon="calendar-week" title="Nessuna pianificazione" subtitle="Aggiungi almeno una pianificazione per proseguire." />
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Gruppo</th>
              <th>Tipo</th>
              <th>Durata</th>
              <th>Finestre / giorno</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {study.schedules.map((s) => (
              <tr key={s.id}>
                <td>{groupName(s.groupId)}</td>
                <td>{s.type === "time-contingent" ? "Time-contingent" : "Event-contingent"}</td>
                <td>
                  {s.mode === "numero-giorni"
                    ? `${s.numberOfDays} giorni`
                    : `${s.specificDates?.length ?? 0} date`}
                </td>
                <td>{s.windows.length}</td>
                <td>
                  <div className="cell-actions">
                    <button
                      className="icon-btn icon-btn--danger"
                      aria-label="Rimuovi"
                      onClick={() => removeSchedule(s.id)}
                    >
                      <i className="bi bi-trash" aria-hidden />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <StepFooter onPrev={goPrev} onNext={goNext} />
    </div>
  );
}
