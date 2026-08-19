import { useState } from "react";
import { Table, EmptyState, Modal, Button, Select, Input, ConfirmDialog } from "../../../components/ui";
import { SectionHeader, ComeProcedere } from "../SectionChrome";
import { useEditStudy } from "../useEditStudy";
import type { ScheduleMode, ScheduleRule, ScheduleType } from "../../../data/types";

export function EditPianificazioni() {
  const { study, update } = useEditStudy();
  const [adding, setAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // add-form state
  const [groupId, setGroupId] = useState(study?.groups[0]?.id ?? "");
  const [type, setType] = useState<ScheduleType>("time-contingent");
  const [mode, setMode] = useState<ScheduleMode>("numero-giorni");
  const [numberOfDays, setNumberOfDays] = useState(7);

  if (!study) return null;

  const groupName = (id: string) => study.groups.find((g) => g.id === id)?.name ?? "—";

  const save = () => {
    const rule: ScheduleRule = {
      id: `sch-${Date.now()}`,
      groupId,
      type,
      mode,
      numberOfDays: mode === "numero-giorni" ? numberOfDays : undefined,
      windows: [{ id: `w-${Date.now()}`, label: "Finestra di campionamento", startTime: "10:00", endTime: "11:00" }],
      promptsPerDay: 1,
    };
    update({ schedules: [...study.schedules, rule] });
    setAdding(false);
  };

  return (
    <div>
      <SectionHeader title="Pianificazioni" onAdd={() => setAdding(true)} />

      <ComeProcedere>
        In questa sezione puoi definire quando i partecipanti compilano i questionari.
        Le pianificazioni <strong>time-contingent</strong> inviano le richieste a orari
        prestabiliti; quelle <strong>event-contingent</strong> al verificarsi di un evento.
      </ComeProcedere>

      {study.schedules.length === 0 ? (
        <EmptyState icon="calendar-week" title="Nessuna pianificazione" subtitle="Aggiungi una pianificazione con il pulsante in alto." />
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Titolo</th>
              <th>Condizione</th>
              <th>Tipo di campionamento</th>
              <th style={{ textAlign: "right" }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {study.schedules.map((s, i) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 500 }}>Pianificazione {i + 1}</td>
                <td>{groupName(s.groupId)}</td>
                <td>{s.type === "time-contingent" ? "Time-contingent" : "Event-contingent"}</td>
                <td>
                  <div className="cell-actions">
                    <button className="icon-btn" aria-label="Modifica"><i className="bi bi-pencil-square" aria-hidden /></button>
                    <button className="icon-btn" aria-label="Duplica"><i className="bi bi-files" aria-hidden /></button>
                    <button className="icon-btn icon-btn--danger" aria-label="Elimina" onClick={() => setDeleteId(s.id)}>
                      <i className="bi bi-trash" aria-hidden />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Add modal */}
      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="Nuova pianificazione"
        footer={
          <>
            <Button variant="base" onClick={() => setAdding(false)}>Annulla</Button>
            <Button onClick={save}>Salva</Button>
          </>
        }
      >
        <div className="stack">
          <Select
            label="Condizione / gruppo"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            options={study.groups.map((g) => ({ value: g.id, label: g.name }))}
          />
          <Select
            label="Tipo di studio"
            value={type}
            onChange={(e) => setType(e.target.value as ScheduleType)}
            options={[
              { value: "time-contingent", label: "Time-contingent" },
              { value: "event-contingent", label: "Event-contingent" },
            ]}
          />
          <Select
            label="Durata"
            value={mode}
            onChange={(e) => setMode(e.target.value as ScheduleMode)}
            options={[
              { value: "numero-giorni", label: "Numero di giorni" },
              { value: "date-specifiche", label: "Date specifiche" },
            ]}
          />
          {mode === "numero-giorni" && (
            <Input
              type="number"
              min={1}
              label="Giorni"
              value={numberOfDays}
              onChange={(e) => setNumberOfDays(Number(e.target.value))}
            />
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && update({ schedules: study.schedules.filter((s) => s.id !== deleteId) })}
        title="Eliminare la pianificazione?"
        message="Se decidi di procedere l'elemento verrà eliminato definitivamente."
      />
    </div>
  );
}
