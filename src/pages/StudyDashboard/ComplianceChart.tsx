import type { Participant } from "../../data/types";
import "./ComplianceChart.css";

const LEVELS = [
  { key: "alta", label: "Alta", color: "var(--soft-green-bg)", bar: "#4caf7d" },
  { key: "media", label: "Media", color: "var(--soft-yellow-bg)", bar: "#e6c34a" },
  { key: "bassa", label: "Bassa", color: "var(--soft-red-bg)", bar: "#e07a86" },
  { key: "inattivo", label: "Inattivo", color: "var(--soft-gray-bg)", bar: "#adb5bd" },
] as const;

export function ComplianceChart({ participants }: { participants: Participant[] }) {
  const counts = LEVELS.map((l) => ({
    ...l,
    count: participants.filter((p) => p.compliance === l.key).length,
  }));
  const max = Math.max(1, ...counts.map((c) => c.count));

  return (
    <div className="cchart">
      <div className="cchart__bars">
        {counts.map((c) => (
          <div key={c.key} className="cchart__col">
            <div className="cchart__bar-track">
              <div
                className="cchart__bar"
                style={{ height: `${(c.count / max) * 100}%`, background: c.bar }}
              >
                <span className="cchart__value">{c.count}</span>
              </div>
            </div>
            <span className="cchart__label">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
