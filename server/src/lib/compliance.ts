export type ComplianceLevel = "alta" | "media" | "bassa" | "inattivo";

/** Same thresholds as the frontend (src/data/types.ts). */
export function complianceFromPct(pct: number): ComplianceLevel {
  if (pct <= 0) return "inattivo";
  if (pct >= 70) return "alta";
  if (pct >= 40) return "media";
  return "bassa";
}
