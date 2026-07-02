import { useState } from "react";
import type { Study } from "../../data/types";
import "./StudyCalendar.css";

const MONTHS = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];
const WEEKDAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

/** Days (1-based) that carry a sampling window, derived from the study's schedules. */
function scheduledDays(study: Study, daysInMonth: number): Set<number> {
  const set = new Set<number>();
  if (study.schedules.length === 0) return set;
  const windowsCount = study.schedules.reduce((acc, s) => acc + s.windows.length, 0);
  if (windowsCount === 0) return set;
  // Spread prompts across weekdays for a representative view.
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(2026, 4, d).getDay(); // May 2026
    if (dow !== 0 && dow !== 6) set.add(d);
  }
  return set;
}

export function StudyCalendar({ study }: { study: Study }) {
  const [monthIdx, setMonthIdx] = useState(4); // Maggio (May)
  const year = 2026;

  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const firstDow = (new Date(year, monthIdx, 1).getDay() + 6) % 7; // Mon=0
  const scheduled = scheduledDays(study, daysInMonth);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="scal">
      <div className="scal__head">
        <div className="scal__title">
          <strong>{MONTHS[monthIdx]}</strong> {year}
        </div>
        <div className="scal__nav">
          <button
            className="icon-btn"
            aria-label="Mese precedente"
            onClick={() => setMonthIdx((m) => (m + 11) % 12)}
          >
            <i className="bi bi-chevron-left" aria-hidden />
          </button>
          <button
            className="icon-btn"
            aria-label="Mese successivo"
            onClick={() => setMonthIdx((m) => (m + 1) % 12)}
          >
            <i className="bi bi-chevron-right" aria-hidden />
          </button>
        </div>
      </div>

      <div className="scal__grid scal__weekdays">
        {WEEKDAYS.map((w) => (
          <div key={w} className="scal__weekday">
            {w}
          </div>
        ))}
      </div>

      <div className="scal__grid">
        {cells.map((d, i) => (
          <div key={i} className={`scal__cell ${d === null ? "is-empty" : ""}`}>
            {d !== null && (
              <>
                <span className="scal__day">{d}</span>
                {scheduled.has(d) && (
                  <span className="scal__event">
                    <i className="bi bi-clock" aria-hidden /> Finestra
                  </span>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
