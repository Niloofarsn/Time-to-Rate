import "./Badge.css";
import type { ComplianceLevel, StudyStatus } from "../../data/types";

type Tone = "green" | "yellow" | "red" | "gray";

const STATUS_MAP: Record<StudyStatus, { label: string; tone: Tone }> = {
  attivo: { label: "Attivo", tone: "green" },
  bozza: { label: "Bozza", tone: "yellow" },
  completato: { label: "Completato", tone: "gray" },
};

const COMPLIANCE_MAP: Record<ComplianceLevel, { label: string; tone: Tone }> = {
  alta: { label: "Alta", tone: "green" },
  media: { label: "Media", tone: "yellow" },
  bassa: { label: "Bassa", tone: "red" },
  inattivo: { label: "Inattivo", tone: "gray" },
};

export function Badge({ tone = "gray", children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

export function StatusBadge({ status }: { status: StudyStatus }) {
  const { label, tone } = STATUS_MAP[status];
  return <Badge tone={tone}>{label}</Badge>;
}

export function ComplianceBadge({ level }: { level: ComplianceLevel }) {
  const { label, tone } = COMPLIANCE_MAP[level];
  return <Badge tone={tone}>{label}</Badge>;
}
