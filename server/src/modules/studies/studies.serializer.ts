import type { Prisma } from "@prisma/client";

// A study with all nested relations loaded.
export const studyInclude = {
  groups: true,
  schedules: { include: { windows: true } },
  notifications: true,
  consent: true,
  instructions: true,
  participants: true,
} satisfies Prisma.StudyInclude;

type StudyWithRelations = Prisma.StudyGetPayload<{ include: typeof studyInclude }>;

function dateOnly(d: Date | null): string | null {
  return d ? d.toISOString().slice(0, 10) : null;
}

/** Shape a DB study into the JSON the frontend consumes (mirrors src/data/types.ts). */
export function toStudyDTO(s: StudyWithRelations) {
  return {
    id: s.id,
    title: s.title,
    description: s.description,
    status: s.status,
    code: s.code,
    piName: s.piName,
    startDate: dateOnly(s.startDate),
    endDate: dateOnly(s.endDate),
    createdAt: dateOnly(s.createdAt),
    groups: s.groups.map((g) => ({ id: g.id, name: g.name })),
    schedules: s.schedules.map((sc) => ({
      id: sc.id,
      groupId: sc.groupId,
      type: sc.type,
      mode: sc.mode,
      numberOfDays: sc.numberOfDays ?? undefined,
      specificDates: sc.specificDates ? (JSON.parse(sc.specificDates) as string[]) : undefined,
      promptsPerDay: sc.promptsPerDay ?? undefined,
      windows: sc.windows.map((w) => ({
        id: w.id,
        label: w.label,
        startTime: w.startTime,
        endTime: w.endTime,
      })),
    })),
    notifications: s.notifications.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      recipients: n.recipients,
      trigger: n.trigger,
    })),
    consent: s.consent.map((c) => ({
      id: c.id,
      title: c.title,
      type: c.type,
      fileName: c.fileName ?? undefined,
    })),
    instructions: s.instructions.map((i) => ({
      id: i.id,
      title: i.title,
      fileName: i.fileName ?? undefined,
    })),
    participants: s.participants.map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      groupId: p.groupId,
      compliance: p.compliance,
      compliancePct: p.compliancePct,
      lastResponse: dateOnly(p.lastResponse),
      status: p.status,
      isTester: p.isTester,
    })),
  };
}

export type { StudyWithRelations };
