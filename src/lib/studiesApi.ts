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
  createdBy?: BackendCmsUser | null;
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
    createdBy: s.createdBy ? piName(s.createdBy) : undefined,
    // The list endpoint returns summaries; details are loaded per-study later.
    groups: [],
    schedules: [],
    notifications: [],
    consent: [],
    instructions: [],
    participants: [],
  };
}

/** A backend study id is a 24-char Mongo ObjectId; locally-created drafts are not. */
export function isBackendId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/** Delete a study on the backend (DELETE /survey/:id). */
export async function deleteStudyApi(id: string): Promise<void> {
  await apiRequest(`/survey/${id}`, { method: "DELETE" });
}

interface ExtraContentResponse {
  result: { _id?: string; id?: string };
}
interface SurveyWriteResponse {
  result: BackendSurvey;
}

/** Create an ExtraContent document (consent/privacy) and return its id. */
async function createExtraContent(title: string, type: "INFORMED_CONSENT" | "PRIVACY"): Promise<string> {
  const res = await apiRequest<ExtraContentResponse>("/extracontent", {
    method: "PUT",
    body: { title, content: `${title} (bozza) — da completare.`, type },
  });
  return res.result._id || res.result.id || "";
}

/**
 * Create a new study on the backend.
 * The backend requires informed-consent + privacy documents and start/end dates,
 * so we create the two consent documents first, then the survey.
 */
export async function createStudyApi(title: string, description: string): Promise<Study> {
  const idInformedConsent = await createExtraContent("Consenso informato", "INFORMED_CONSENT");
  const idPrivacyConsent = await createExtraContent("Informativa privacy", "PRIVACY");

  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 30);

  const res = await apiRequest<SurveyWriteResponse>("/survey", {
    method: "PUT",
    body: {
      survey: {
        name: title,
        description,
        active: false,
        type: "PERIOD",
        totalDays: 0,
        dateStart: start.toISOString(),
        dateEnd: end.toISOString(),
        idInformedConsent,
        idPrivacyConsent,
      },
    },
  });
  return mapSurveyToStudy(res.result);
}

interface SurveyDetailResponse {
  result: BackendSurvey & {
    idInformedConsent?: string;
    idPrivacyConsent?: string;
    active?: boolean;
    totalDays?: number;
  };
}

/**
 * Update a study's title/description on the backend.
 * The backend's PUT /survey re-validates required fields (name, dates, consent
 * refs), so we first GET the full survey and resend those unchanged.
 */
export async function updateStudyDetailsApi(
  id: string,
  patch: { title: string; description: string },
): Promise<Study> {
  const current = await apiRequest<SurveyDetailResponse>(`/survey/${id}`);
  const s = current.result;

  const res = await apiRequest<SurveyWriteResponse>("/survey", {
    method: "PUT",
    body: {
      survey: {
        _id: id,
        name: patch.title,
        description: patch.description,
        active: s.active ?? false,
        type: s.type ?? "PERIOD",
        totalDays: s.totalDays ?? 0,
        dateStart: s.dateStart,
        dateEnd: s.dateEnd,
        idInformedConsent: s.idInformedConsent,
        idPrivacyConsent: s.idPrivacyConsent,
      },
    },
  });
  return mapSurveyToStudy(res.result);
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
