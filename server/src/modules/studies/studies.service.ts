import { prisma } from "../../prisma";
import { HttpError } from "../../lib/http";
import { studyInclude } from "./studies.serializer";

/** Random short study code, similar to the frontend's. */
export function randomCode(): string {
  return Math.random().toString(36).slice(2, 10);
}

const DEFAULT_GROUP_NAMES = [
  "Gruppo di controllo",
  "Gruppo sperimentale 1",
  "Gruppo sperimentale 2",
];

export function defaultGroupsData() {
  return DEFAULT_GROUP_NAMES.map((name) => ({ name }));
}

/** Fetch a study owned by the user, or throw 404/403. */
export async function getOwnedStudy(studyId: string, userId: string) {
  const study = await prisma.study.findUnique({
    where: { id: studyId },
    include: studyInclude,
  });
  if (!study) throw new HttpError(404, "Studio non trovato");
  if (study.ownerId !== userId) throw new HttpError(403, "Non hai accesso a questo studio");
  return study;
}

/** Lightweight ownership guard that doesn't load relations. */
export async function assertOwnership(studyId: string, userId: string) {
  const study = await prisma.study.findUnique({
    where: { id: studyId },
    select: { id: true, ownerId: true },
  });
  if (!study) throw new HttpError(404, "Studio non trovato");
  if (study.ownerId !== userId) throw new HttpError(403, "Non hai accesso a questo studio");
  return study;
}
