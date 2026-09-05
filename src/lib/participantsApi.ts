import { apiRequest } from "./api";
import { complianceFromPct, type ComplianceLevel } from "../data/types";

export interface StudyParticipant {
  id: string;
  userId: string;
  name: string;
  email: string;
  respondedCount: number;
  lastResponse: string | null; // YYYY-MM-DD
  subscribedAt: string | null;
  consent: boolean;
  compliance: ComplianceLevel;
  compliancePct: number;
}

interface BackendUser {
  userID?: string;
  mail?: string;
  name?: string;
  surname?: string;
}
interface BackendEnrollment {
  _id?: string;
  user?: BackendUser | null;
  datesResponseComplete?: { date?: string | null }[];
  subscriptionDate?: string;
  acceptedInformedConsent?: boolean;
}

/**
 * Fetch a study's participants (UserSurvey enrollments) and compute a compliance
 * level for each.
 *
 * The backend stores each completed response as a date; it does not store an
 * "expected" total. We therefore express compliance RELATIVE to the most active
 * participant in the study (the top responder = 100%). It's a proxy, not an
 * absolute rate — good enough to show the distribution, and honest about it.
 */
export async function fetchParticipants(studyId: string): Promise<{
  participants: StudyParticipant[];
  total: number;
}> {
  const res = await apiRequest<{ result: BackendEnrollment[] }>(`/survey/${studyId}/users`);
  const rows = res?.result ?? [];

  const base = rows.map((e) => {
    const dates = (e.datesResponseComplete ?? [])
      .map((d) => d?.date)
      .filter((d): d is string => !!d);
    const responded = dates.length;
    const last = dates.length ? dates.reduce((a, b) => (a > b ? a : b)) : null;
    const u = e.user ?? undefined;
    const name =
      (u && ([u.name, u.surname].filter(Boolean).join(" ") || u.userID || u.mail)) || "—";
    return {
      id: e._id || u?.userID || Math.random().toString(36).slice(2),
      userId: u?.userID || "",
      name,
      email: u?.mail || "—",
      respondedCount: responded,
      lastResponse: last ? last.slice(0, 10) : null,
      subscribedAt: e.subscriptionDate ? e.subscriptionDate.slice(0, 10) : null,
      consent: !!e.acceptedInformedConsent,
    };
  });

  const max = base.reduce((m, p) => Math.max(m, p.respondedCount), 0);
  const participants: StudyParticipant[] = base.map((p) => {
    const pct = max > 0 ? Math.round((p.respondedCount / max) * 100) : 0;
    return { ...p, compliancePct: pct, compliance: complianceFromPct(pct) };
  });

  return { participants, total: participants.length };
}
