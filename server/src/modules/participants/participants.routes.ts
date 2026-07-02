import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../prisma";
import { asyncHandler, HttpError } from "../../lib/http";
import { assertOwnership, getOwnedStudy } from "../studies/studies.service";
import { toStudyDTO } from "../studies/studies.serializer";
import { sendInviteEmail } from "../notifications/notifications.service";
import { recomputeCompliance } from "../scheduling/scheduling.service";

// mergeParams so we can read :studyId from the parent mount path.
export const participantsRouter = Router({ mergeParams: true });

const inviteBody = z.object({
  emails: z.array(z.string().email()).min(1).max(100),
  condition: z.string().default("random"), // groupId or "random"
  isTester: z.boolean().optional(),
});

// POST /studies/:studyId/participants — invite participants
participantsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const { studyId } = req.params as { studyId: string };
    const study = await getOwnedStudy(studyId, req.user!.sub);
    const { emails, condition, isTester } = inviteBody.parse(req.body);

    if (study.groups.length === 0) throw new HttpError(400, "Lo studio non ha gruppi");

    const created = await prisma.$transaction(
      emails.map((email, i) => {
        const groupId =
          condition === "random"
            ? study.groups[i % study.groups.length].id
            : condition;
        return prisma.participant.create({
          data: {
            studyId,
            groupId,
            name: email.split("@")[0],
            email,
            status: "invitato",
            isTester: isTester ?? false,
          },
        });
      }),
    );

    await prisma.invitation.createMany({
      data: emails.map((email) => ({ studyId, email })),
    });
    emails.forEach((email) => sendInviteEmail(email, study.title, study.code));

    const updated = await getOwnedStudy(studyId, req.user!.sub);
    res.status(201).json({ created: created.length, study: toStudyDTO(updated) });
  }),
);

// DELETE /studies/:studyId/participants/:participantId
participantsRouter.delete(
  "/:participantId",
  asyncHandler(async (req, res) => {
    const { studyId, participantId } = req.params as {
      studyId: string;
      participantId: string;
    };
    await assertOwnership(studyId, req.user!.sub);
    const participant = await prisma.participant.findUnique({ where: { id: participantId } });
    if (!participant || participant.studyId !== studyId) {
      throw new HttpError(404, "Partecipante non trovato");
    }
    await prisma.participant.delete({ where: { id: participantId } });
    res.status(204).end();
  }),
);

// POST /studies/:studyId/participants/:participantId/responses
// Simulates a participant answering the earliest pending prompt, then recomputes compliance.
participantsRouter.post(
  "/:participantId/responses",
  asyncHandler(async (req, res) => {
    const { studyId, participantId } = req.params as {
      studyId: string;
      participantId: string;
    };
    await assertOwnership(studyId, req.user!.sub);

    const participant = await prisma.participant.findUnique({ where: { id: participantId } });
    if (!participant || participant.studyId !== studyId) {
      throw new HttpError(404, "Partecipante non trovato");
    }

    const pending = await prisma.promptEvent.findFirst({
      where: { participantId, status: "pending" },
      orderBy: { scheduledAt: "asc" },
    });
    if (!pending) throw new HttpError(409, "Nessuna richiesta in attesa di risposta");

    await prisma.$transaction([
      prisma.response.create({
        data: {
          promptEventId: pending.id,
          participantId,
          answers: JSON.stringify(req.body?.answers ?? {}),
        },
      }),
      prisma.promptEvent.update({
        where: { id: pending.id },
        data: { status: "responded" },
      }),
      prisma.participant.update({
        where: { id: participantId },
        data: { status: "attivo" },
      }),
    ]);
    await recomputeCompliance(participantId);
    res.status(201).json({ ok: true });
  }),
);

// GET /studies/:studyId/participants/:participantId — details + response history
participantsRouter.get(
  "/:participantId",
  asyncHandler(async (req, res) => {
    const { studyId, participantId } = req.params as {
      studyId: string;
      participantId: string;
    };
    await assertOwnership(studyId, req.user!.sub);

    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      include: {
        group: true,
        promptEvents: {
          orderBy: { scheduledAt: "desc" },
          take: 50,
          include: { response: true },
        },
      },
    });
    if (!participant || participant.studyId !== studyId) {
      throw new HttpError(404, "Partecipante non trovato");
    }

    res.json({
      id: participant.id,
      name: participant.name,
      email: participant.email,
      groupId: participant.groupId,
      groupName: participant.group.name,
      compliance: participant.compliance,
      compliancePct: participant.compliancePct,
      status: participant.status,
      isTester: participant.isTester,
      lastResponse: participant.lastResponse?.toISOString().slice(0, 10) ?? null,
      history: participant.promptEvents.map((e) => ({
        id: e.id,
        scheduledAt: e.scheduledAt.toISOString(),
        expiresAt: e.expiresAt.toISOString(),
        status: e.status,
        responded: e.status === "responded",
      })),
    });
  }),
);
