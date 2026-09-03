import { apiRequest } from "./api";

// A study awaiting a PI's activation approval.
export interface ApprovalRequest {
  studyId: string;
  studyName: string;
  studyDescription: string;
  code: string;
  requestedBy: string; // researcher who created/requested it
  active: boolean;
}

interface BackendUserRef {
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
  pendingAuthorizationRequest?: boolean;
  createdBy?: BackendUserRef | null;
  idInformedConsent?: string;
  idPrivacyConsent?: string;
  totalDays?: number;
  dateStart?: string | null;
  dateEnd?: string | null;
  type?: string;
}

function requesterName(u: BackendUserRef | null | undefined): string {
  if (!u) return "Ricercatore";
  return u.fullName || [u.name, u.surname].filter(Boolean).join(" ") || u.mail || "Ricercatore";
}

/** Studies awaiting the current PI's approval (pendingAuthorizationRequest = true). */
export async function fetchApprovals(): Promise<ApprovalRequest[]> {
  const res = await apiRequest<{ result: { survey: BackendSurvey }[] }>("/surveys");
  const entries = res?.result ?? [];
  const seen = new Set<string>();
  const out: ApprovalRequest[] = [];
  for (const entry of entries) {
    const s = entry?.survey;
    if (!s || !s.pendingAuthorizationRequest) continue;
    const id = s._id || s.id || "";
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push({
      studyId: id,
      studyName: s.name,
      studyDescription: s.description || "",
      code: s.code || "",
      requestedBy: requesterName(s.createdBy),
      active: !!s.active,
    });
  }
  return out;
}

/** Approve a pending study: activate it and clear the pending flag (PUT /survey). */
export async function approveStudy(studyId: string): Promise<void> {
  // Fetch the full survey so we can resend the required fields on update.
  const res = await apiRequest<{ result: BackendSurvey }>(`/survey/${studyId}`);
  const s = res.result;
  await apiRequest("/survey", {
    method: "PUT",
    body: {
      survey: {
        _id: studyId,
        name: s.name,
        description: s.description,
        idInformedConsent: s.idInformedConsent,
        idPrivacyConsent: s.idPrivacyConsent,
        totalDays: s.totalDays,
        dateStart: s.dateStart,
        dateEnd: s.dateEnd,
        type: s.type,
        active: true,
        pendingAuthorizationRequest: false,
      },
    },
  });
}

/** Search PI users to send an activation request to (used by researchers). */
export async function searchPIs(query: string): Promise<{ id: string; name: string; mail: string }[]> {
  const res = await apiRequest<{ result: { _id?: string; id?: string; fullName?: string; name?: string; surname?: string; mail: string }[] }>(
    "/users/pi",
    { method: "POST", body: { query } },
  );
  return (res?.result ?? []).map((u) => ({
    id: u._id || u.id || "",
    name: u.fullName || [u.name, u.surname].filter(Boolean).join(" ") || u.mail,
    mail: u.mail,
  }));
}

/** Researcher requests a PI to activate a study (POST /survey/:id/activaterequest). */
export async function requestActivation(studyId: string, referrerPI: string): Promise<void> {
  await apiRequest(`/survey/${studyId}/activaterequest`, {
    method: "POST",
    body: { referrerPI },
  });
}
