import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generatePromptEvents, recomputeCompliance } from "../src/modules/scheduling/scheduling.service";

const prisma = new PrismaClient();

const GROUPS = ["Gruppo di controllo", "Gruppo sperimentale 1", "Gruppo sperimentale 2"];

/** Mark a fraction of a participant's pending prompts as responded, then recompute compliance. */
async function simulateResponses(participantId: string, fraction: number) {
  const pending = await prisma.promptEvent.findMany({
    where: { participantId, status: "pending" },
    orderBy: { scheduledAt: "asc" },
  });
  const n = Math.round(pending.length * fraction);
  for (const ev of pending.slice(0, n)) {
    await prisma.response.create({
      data: { promptEventId: ev.id, participantId, answers: JSON.stringify({ mood: 3 }) },
    });
    await prisma.promptEvent.update({ where: { id: ev.id }, data: { status: "responded" } });
  }
  if (n > 0) await prisma.participant.update({ where: { id: participantId }, data: { status: "attivo" } });
  await recomputeCompliance(participantId);
}

async function main() {
  // Clean slate (cascades through all relations).
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      name: "Mario Rossi",
      email: "mariorossi@unimib.it",
      role: "Ricercatore",
      passwordHash: await bcrypt.hash("password123", 10),
    },
  });

  const groupData = () => ({ create: GROUPS.map((name) => ({ name })) });

  // 1) Stress momentaneo — fully populated, active
  const stress = await prisma.study.create({
    data: {
      title: "Stress momentaneo",
      description:
        "Analisi delle variazioni dello stress nella vita quotidiana in relazione al contesto e alle attività svolte.",
      status: "attivo",
      code: "ck4Zif342",
      piName: "Mario Rossi",
      startDate: new Date("2026-01-12"),
      endDate: new Date("2026-07-12"),
      ownerId: user.id,
      groups: groupData(),
      notifications: {
        create: [
          {
            title: "Notifica 1",
            body: "È il momento di compilare il questionario.",
            recipients: "Gruppo sperimentale 1",
            trigger: "Inizio finestra",
          },
        ],
      },
      consent: {
        create: [
          { title: "Consenso informato Stress momentaneo", type: "Consenso informato", fileName: "consenso.pdf" },
        ],
      },
      instructions: { create: [{ title: "Istruzioni partecipanti", fileName: "istruzioni.pdf" }] },
    },
    include: { groups: true },
  });

  const control = stress.groups.find((g) => g.name === GROUPS[0])!;
  const exp1 = stress.groups.find((g) => g.name === GROUPS[1])!;

  // Schedule: time-contingent, 14 days, 3 windows/day, for experimental group 1.
  await prisma.scheduleRule.create({
    data: {
      studyId: stress.id,
      groupId: exp1.id,
      type: "time-contingent",
      mode: "numero-giorni",
      numberOfDays: 14,
      promptsPerDay: 3,
      windows: {
        create: [
          { label: "Finestra di campionamento", startTime: "09:00", endTime: "11:00" },
          { label: "Finestra di campionamento", startTime: "13:00", endTime: "15:00" },
          { label: "Finestra di campionamento", startTime: "17:00", endTime: "19:00" },
        ],
      },
    },
  });

  const [mario, anna, sara, fabio] = await Promise.all([
    prisma.participant.create({ data: { studyId: stress.id, groupId: exp1.id, name: "Mario Rossi", email: "mario.rossi@example.com" } }),
    prisma.participant.create({ data: { studyId: stress.id, groupId: exp1.id, name: "Anna Bianchi", email: "anna.bianchi@example.com" } }),
    prisma.participant.create({ data: { studyId: stress.id, groupId: exp1.id, name: "Sara Conti", email: "sara.conti@example.com" } }),
    prisma.participant.create({ data: { studyId: stress.id, groupId: control.id, name: "Fabio Bellini", email: "fabio.bellini@example.com" } }),
  ]);

  // Expand schedule rules into concrete prompt events, then simulate responses.
  await generatePromptEvents(stress.id);
  await simulateResponses(mario.id, 0.92);
  await simulateResponses(anna.id, 0.58);
  await simulateResponses(sara.id, 0.24);
  // Fabio has no schedule (control group) → stays inattivo.

  // 2..5) Other studies (groups only)
  const others = [
    {
      title: "Legami precoci",
      description: "Ricerca sull'influenza degli stili di attaccamento infantile sullo sviluppo della personalità in età adulta.",
      status: "attivo", code: "LGPATT", piName: "Laura Giallo",
      startDate: new Date("2026-02-12"), endDate: new Date("2026-10-24"),
    },
    {
      title: "Peso emotivo",
      description: "Studio sui meccanismi psicologici alla base del rapporto disfunzionale con il cibo in giovani adulti.",
      status: "attivo", code: "PSEALI", piName: "Mario Rossi",
      startDate: new Date("2026-01-25"), endDate: new Date("2026-11-23"),
    },
    {
      title: "Mente attiva",
      description: "Studio esplorativo sui processi attentivi durante attività quotidiane.",
      status: "bozza", code: "MNTATT", piName: "Luca Verde",
      startDate: null, endDate: null,
    },
    {
      title: "Sonno profondo",
      description: "Relazione tra qualità del sonno e regolazione emotiva.",
      status: "completato", code: "SNPMEM", piName: "Anna Bianchi",
      startDate: new Date("2024-01-15"), endDate: new Date("2024-03-23"),
    },
  ];

  for (const s of others) {
    await prisma.study.create({
      data: { ...s, ownerId: user.id, groups: groupData() },
    });
  }

  const counts = {
    users: await prisma.user.count(),
    studies: await prisma.study.count(),
    participants: await prisma.participant.count(),
    promptEvents: await prisma.promptEvent.count(),
    responses: await prisma.response.count(),
  };
  console.log("Seed completato:", counts);
  console.log("Login: mariorossi@unimib.it / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
