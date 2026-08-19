import { apiRequest } from "./api";
import type { Study, StudyStatus } from "../data/types";

// ---- Shapes returned by the CMS backend (partial) ----
interface BackendCmsUser {
  _id?: string;
  id?: string;
  name?: string;
  surname?: string;
  fullName?: string;
  mail?: string;
}

interface BackendSurvey {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  code?: string;
  active?: boolean;
  type?: "PERIOD" | "AMOUNT_DAYS";
  totalDays?: number;
  dateStart?: string | null;
  dateEnd?: string | null;
  referrerPI?: BackendCmsUser | null;
  pendingAuthorizationRequest?: boolean;
  createdAt?: string;
}

// The /surveys endpoint returns the user's surveys as { survey, level } entries.
interface SurveysResponse {
  success: boolean;
  result: { survey: BackendSurvey; level: string }[];
}

function dateOnly(v: string | null | undefined): string | null {
  if (!v) return null;
  return String(v).slice(0, 10);
}

function piName(pi: BackendCmsUser | null | undefined): string {
  if (!pi) return "—";
  if (pi.fullName) return pi.fullName;
  const full = [pi.name, pi.surname].filter(Boolean).join(" ");
  return full || pi.mail || "—";
}

/** Derive the frontend status from the backend survey flags/dates. */
function deriveStatus(s: BackendSurvey): StudyStatus {
  if (s.active) {
    if (s.dateEnd && new Date(s.dateEnd) < new Date()) return "completato";
    return "attivo";
  }
  return "bozza";
}

/** Map one backend Survey to the frontend Study shape. */
export function mapSurveyToStudy(s: BackendSurvey): Study {
  return {
    id: s._id || s.id || "",
    title: s.name,
    description: s.description || "",
    status: deriveStatus(s),
    code: s.code || "—",
    piName: piName(s.referrerPI),
    startDate: dateOnly(s.dateStart),
    endDate: dateOnly(s.dateEnd),
    createdAt: dateOnly(s.createdAt) || "",
    // The list endpoint returns summaries; details are loaded per-study later.
    groups: [],
    schedules: [],
    notifications: [],
    consent: [],
    instructions: [],
    participants: [],
  };
}

/** Fetch the current researcher's studies from the backend. */
export async function fetchStudies(): Promise<Study[]> {
  const res = await apiRequest<SurveysResponse>("/surveys");
  const entries = res?.result ?? [];
  // De-duplicate by id (a survey can appear once per access entry).
  const byId = new Map<string, Study>();
  for (const entry of entries) {
    if (!entry?.survey) continue;
    const study = mapSurveyToStudy(entry.survey);
    if (study.id) byId.set(study.id, study);
  }
  return Array.from(byId.values());
}
