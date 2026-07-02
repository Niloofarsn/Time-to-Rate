import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../prisma";
import { asyncHandler, HttpError } from "../../lib/http";
import { requireAuth } from "../../middleware/auth";
import {
  assertOwnership,
  defaultGroupsData,
  getOwnedStudy,
  randomCode,
} from "./studies.service";
import { studyInclude, toStudyDTO } from "./studies.serializer";
import { generatePromptEvents } from "../scheduling/scheduling.service";
import { participantsRouter } from "../participants/participants.routes";
import type { Request } from "express";

export const studiesRouter = Router();
studiesRouter.use(requireAuth);

/** Express 5 types params as string | string[]; our routes only use scalar params. */
function p(req: Request, name: string): string {
  const v = req.params[name];
  return Array.isArray(v) ? v[0] : v;
}

/* ------------------------------- validation ------------------------------- */

const createBody = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  piName: z.string().optional(),
});

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const updateBody = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  piName: z.string().optional(),
  status: z.enum(["bozza", "attivo", "completato"]).optional(),
  startDate: dateStr.nullable().optional(),
  endDate: dateStr.nullable().optional(),
});

const scheduleBody = z.object({
  groupId: z.string(),
  type: z.enum(["time-contingent", "event-contingent"]),
  mode: z.enum(["numero-giorni", "date-specifiche"]),
  numberOfDays: z.number().int().positive().optional(),
  specificDates: z.array(dateStr).optional(),
  windows: z
    .array(
      z.object({
        label: z.string().optional(),
        startTime: z.string(),
        endTime: z.string(),
      }),
    )
    .default([]),
});

const notificationBody = z.object({
  title: z.string().min(1),
  body: z.string().optional(),
  recipients: z.string().optional(),
  trigger: z.string().optional(),
});

const consentBody = z.object({
  title: z.string().min(1),
  type: z.string().optional(),
  fileName: z.string().optional(),
});

const instructionBody = z.object({
  title: z.string().min(1),
  fileName: z.string().optional(),
});

function toDate(v: string | null | undefined): Date | null | undefined {
  if (v === undefined) return undefined;
  return v === null ? null : new Date(v);
}

/* --------------------------------- studies -------------------------------- */

// GET /studies
studiesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const studies = await prisma.study.findMany({
      where: { ownerId: req.user!.sub },
      include: studyInclude,
      orderBy: { createdAt: "desc" },
    });
    res.json(studies.map(toStudyDTO));
  }),
);

// POST /studies — create a draft with default groups
studiesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const body = createBody.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });

    const study = await prisma.study.create({
      data: {
        title: body.title ?? "",
        description: body.description ?? "",
        piName: body.piName ?? user?.name ?? "",
        code: randomCode(),
        ownerId: req.user!.sub,
        groups: { create: defaultGroupsData() },
      },
      include: studyInclude,
    });
    res.status(201).json(toStudyDTO(study));
  }),
);

// GET /studies/:id
studiesRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const study = await getOwnedStudy(p(req, "id"), req.user!.sub);
    res.json(toStudyDTO(study));
  }),
);

// PATCH /studies/:id — update scalar fields
studiesRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    await assertOwnership(p(req, "id"), req.user!.sub);
    const body = updateBody.parse(req.body);
    await prisma.study.update({
      where: { id: p(req, "id") },
      data: {
        title: body.title,
        description: body.description,
        piName: body.piName,
        status: body.status,
        startDate: toDate(body.startDate),
        endDate: toDate(body.endDate),
      },
    });
    const study = await getOwnedStudy(p(req, "id"), req.user!.sub);
    res.json(toStudyDTO(study));
  }),
);

// DELETE /studies/:id
studiesRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await assertOwnership(p(req, "id"), req.user!.sub);
    await prisma.study.delete({ where: { id: p(req, "id") } });
    res.status(204).end();
  }),
);

// POST /studies/:id/duplicate
studiesRouter.post(
  "/:id/duplicate",
  asyncHandler(async (req, res) => {
    const original = await getOwnedStudy(p(req, "id"), req.user!.sub);
    const copy = await prisma.study.create({
      data: {
        title: `${original.title} - Copia`,
        description: original.description,
        status: "bozza",
        code: randomCode(),
        piName: original.piName,
        ownerId: req.user!.sub,
        groups: { create: original.groups.map((g) => ({ name: g.name })) },
      },
      include: studyInclude,
    });
    res.status(201).json(toStudyDTO(copy));
  }),
);

// POST /studies/:id/activate — set active + generate prompt events
studiesRouter.post(
  "/:id/activate",
  asyncHandler(async (req, res) => {
    const study = await getOwnedStudy(p(req, "id"), req.user!.sub);
    const today = new Date();
    await prisma.study.update({
      where: { id: study.id },
      data: { status: "attivo", startDate: study.startDate ?? today },
    });
    const generated = await generatePromptEvents(study.id);
    const updated = await getOwnedStudy(study.id, req.user!.sub);
    res.json({ study: toStudyDTO(updated), promptEventsGenerated: generated });
  }),
);

/* ------------------------- wizard sub-resources --------------------------- */

// Schedules
studiesRouter.post(
  "/:id/schedules",
  asyncHandler(async (req, res) => {
    await assertOwnership(p(req, "id"), req.user!.sub);
    const body = scheduleBody.parse(req.body);
    await prisma.scheduleRule.create({
      data: {
        studyId: p(req, "id"),
        groupId: body.groupId,
        type: body.type,
        mode: body.mode,
        numberOfDays: body.numberOfDays,
        specificDates: body.specificDates ? JSON.stringify(body.specificDates) : null,
        promptsPerDay: body.windows.length,
        windows: {
          create: body.windows.map((w) => ({
            label: w.label ?? "Finestra di campionamento",
            startTime: w.startTime,
            endTime: w.endTime,
          })),
        },
      },
    });
    const study = await getOwnedStudy(p(req, "id"), req.user!.sub);
    res.status(201).json(toStudyDTO(study));
  }),
);

studiesRouter.delete(
  "/:id/schedules/:scheduleId",
  asyncHandler(async (req, res) => {
    await assertOwnership(p(req, "id"), req.user!.sub);
    await prisma.scheduleRule.deleteMany({
      where: { id: p(req, "scheduleId"), studyId: p(req, "id") },
    });
    res.status(204).end();
  }),
);

// Notifications
studiesRouter.post(
  "/:id/notifications",
  asyncHandler(async (req, res) => {
    await assertOwnership(p(req, "id"), req.user!.sub);
    const body = notificationBody.parse(req.body);
    await prisma.notification.create({ data: { studyId: p(req, "id"), ...body } });
    const study = await getOwnedStudy(p(req, "id"), req.user!.sub);
    res.status(201).json(toStudyDTO(study));
  }),
);

studiesRouter.delete(
  "/:id/notifications/:notifId",
  asyncHandler(async (req, res) => {
    await assertOwnership(p(req, "id"), req.user!.sub);
    await prisma.notification.deleteMany({
      where: { id: p(req, "notifId"), studyId: p(req, "id") },
    });
    res.status(204).end();
  }),
);

// Consent documents
studiesRouter.post(
  "/:id/consent",
  asyncHandler(async (req, res) => {
    await assertOwnership(p(req, "id"), req.user!.sub);
    const body = consentBody.parse(req.body);
    await prisma.consentDocument.create({ data: { studyId: p(req, "id"), ...body } });
    const study = await getOwnedStudy(p(req, "id"), req.user!.sub);
    res.status(201).json(toStudyDTO(study));
  }),
);

studiesRouter.delete(
  "/:id/consent/:docId",
  asyncHandler(async (req, res) => {
    await assertOwnership(p(req, "id"), req.user!.sub);
    await prisma.consentDocument.deleteMany({
      where: { id: p(req, "docId"), studyId: p(req, "id") },
    });
    res.status(204).end();
  }),
);

// Instruction documents
studiesRouter.post(
  "/:id/instructions",
  asyncHandler(async (req, res) => {
    await assertOwnership(p(req, "id"), req.user!.sub);
    const body = instructionBody.parse(req.body);
    await prisma.instructionDocument.create({ data: { studyId: p(req, "id"), ...body } });
    const study = await getOwnedStudy(p(req, "id"), req.user!.sub);
    res.status(201).json(toStudyDTO(study));
  }),
);

studiesRouter.delete(
  "/:id/instructions/:docId",
  asyncHandler(async (req, res) => {
    await assertOwnership(p(req, "id"), req.user!.sub);
    await prisma.instructionDocument.deleteMany({
      where: { id: p(req, "docId"), studyId: p(req, "id") },
    });
    res.status(204).end();
  }),
);

// Participants (nested router)
studiesRouter.use("/:studyId/participants", participantsRouter);
