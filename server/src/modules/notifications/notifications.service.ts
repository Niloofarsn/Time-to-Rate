// Push (Firebase) and email (SendGrid/Postmark) are out of scope for this version.
// These stubs log the intent so the rest of the flow works end-to-end and the
// integration points are obvious when real providers are added.

export function sendInviteEmail(email: string, studyTitle: string, code: string): void {
  console.log(`[email:stub] Invito a "${studyTitle}" → ${email} (codice ${code})`);
}

export function schedulePush(participantId: string, scheduledAt: Date): void {
  console.log(`[push:stub] Notifica programmata per ${participantId} @ ${scheduledAt.toISOString()}`);
}
