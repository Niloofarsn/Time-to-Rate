// Domain types for the Time2Rate researcher app.
// Mirrors the entities in the technical-architecture doc; no backend yet.

export type StudyStatus = "attivo" | "bozza" | "completato";

export type ComplianceLevel = "alta" | "media" | "bassa" | "inattivo";

export type ScheduleType = "time-contingent" | "event-contingent";
export type ScheduleMode = "numero-giorni" | "date-specifiche";

export interface StudyGroup {
  id: string;
  name: string; // e.g. "Gruppo di controllo", "Gruppo sperimentale 1"
}

export interface SamplingWindow {
  id: string;
  label: string; // "Finestra di campionamento"
  startTime: string; // "10:00"
  endTime: string; // "11:00"
}

export interface ScheduleRule {
  id: string;
  groupId: string;
  type: ScheduleType;
  mode: ScheduleMode;
  numberOfDays?: number;
  specificDates?: string[]; // ISO dates
  windows: SamplingWindow[];
  promptsPerDay?: number;
}

export interface StudyNotification {
  id: string;
  title: string;
  body: string;
  recipients: string; // group name or "Tutti"
  trigger: string; // e.g. "Inizio finestra"
}

export interface ConsentDocument {
  id: string;
  title: string;
  type: string; // "Consenso informato"
  fileName?: string;
}

export interface InstructionDocument {
  id: string;
  title: string;
  fileName?: string;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  groupId: string;
  compliance: ComplianceLevel;
  compliancePct: number;
  lastResponse: string | null; // ISO date
  status: "attivo" | "invitato" | "rimosso";
  isTester?: boolean;
}

export interface Study {
  id: string;
  title: string;
  description: string;
  status: StudyStatus;
  code: string;
  piName: string;
  startDate: string | null; // ISO
  endDate: string | null; // ISO
  groups: StudyGroup[];
  schedules: ScheduleRule[];
  notifications: StudyNotification[];
  consent: ConsentDocument[];
  instructions: InstructionDocument[];
  participants: Participant[];
  createdAt: string;
}

// Compliance thresholds → badge level
export function complianceFromPct(pct: number): ComplianceLevel {
  if (pct <= 0) return "inattivo";
  if (pct >= 70) return "alta";
  if (pct >= 40) return "media";
  return "bassa";
}
