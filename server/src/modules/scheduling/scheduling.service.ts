import { prisma } from "../../prisma";
import { complianceFromPct } from "../../lib/compliance";

/** Combine a date (midnight) with a "HH:MM" string into a Date. */
function at(date: Date, time: string): Date {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h ?? 0, m ?? 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Generate concrete PromptEvent rows for a study from its schedule rules.
 * This is the heart of the domain: it expands abstract rules
 * (time-contingent, number-of-days vs specific-dates, per-group) into one
 * event per participant per sampling window per day.
 *
 * Event-contingent rules are participant-triggered, so no events are pre-generated.
 * Returns the number of prompt events created.
 */
export async function generatePromptEvents(studyId: string): Promise<number> {
  const study = await prisma.study.findUnique({
    where: { id: studyId },
    include: {
      schedules: { include: { windows: true } },
      participants: true,
    },
  });
  if (!study) return 0;

  const baseDate = study.startDate ? new Date(study.startDate) : new Date();

  // Clear previously generated events so activation is idempotent.
  const ruleIds = study.schedules.map((s) => s.id);
  if (ruleIds.length > 0) {
    await prisma.promptEvent.deleteMany({
      where: { scheduleRuleId: { in: ruleIds }, status: "pending" },
    });
  }

  const toCreate: {
    scheduleRuleId: string;
    participantId: string;
    scheduledAt: Date;
    expiresAt: Date;
  }[] = [];

  for (const rule of study.schedules) {
    if (rule.type !== "time-contingent") continue;

    // Which calendar dates does this rule cover?
    let dates: Date[] = [];
    if (rule.mode === "numero-giorni" && rule.numberOfDays) {
      dates = Array.from({ length: rule.numberOfDays }, (_, i) => addDays(baseDate, i));
    } else if (rule.mode === "date-specifiche" && rule.specificDates) {
      dates = (JSON.parse(rule.specificDates) as string[])
        .map((d) => new Date(d))
        .filter((d) => !Number.isNaN(d.getTime()));
    }

    const groupParticipants = study.participants.filter(
      (p) => p.groupId === rule.groupId && p.status !== "rimosso",
    );

    for (const date of dates) {
      for (const w of rule.windows) {
        for (const p of groupParticipants) {
          toCreate.push({
            scheduleRuleId: rule.id,
            participantId: p.id,
            scheduledAt: at(date, w.startTime),
            expiresAt: at(date, w.endTime),
          });
        }
      }
    }
  }

  if (toCreate.length > 0) {
    await prisma.promptEvent.createMany({ data: toCreate });
  }
  return toCreate.length;
}

/**
 * Recompute a participant's compliance from their prompt events and responses.
 * compliance% = responded events / total events.
 */
export async function recomputeCompliance(participantId: string): Promise<void> {
  const [total, responded, lastResponse] = await Promise.all([
    prisma.promptEvent.count({ where: { participantId } }),
    prisma.promptEvent.count({ where: { participantId, status: "responded" } }),
    prisma.response.findFirst({
      where: { participantId },
      orderBy: { submittedAt: "desc" },
    }),
  ]);

  const pct = total === 0 ? 0 : Math.round((responded / total) * 100);
  await prisma.participant.update({
    where: { id: participantId },
    data: {
      compliancePct: pct,
      compliance: complianceFromPct(pct),
      lastResponse: lastResponse?.submittedAt ?? null,
    },
  });
}
