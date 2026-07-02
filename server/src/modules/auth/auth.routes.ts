import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../prisma";
import { asyncHandler, HttpError } from "../../lib/http";
import { hashPassword, signToken, verifyPassword } from "../../lib/auth";
import { requireAuth } from "../../middleware/auth";

export const authRouter = Router();

const credentials = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerBody = credentials.extend({
  name: z.string().min(1),
});

function publicUser(u: { id: string; name: string; email: string; role: string }) {
  return { id: u.id, name: u.name, email: u.email, role: u.role };
}

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, password } = registerBody.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new HttpError(409, "Email già registrata");

    const user = await prisma.user.create({
      data: { name, email, passwordHash: await hashPassword(password) },
    });
    const token = signToken({ sub: user.id, email: user.email });
    res.status(201).json({ token, user: publicUser(user) });
  }),
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = credentials.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new HttpError(401, "Credenziali non valide");
    }
    const token = signToken({ sub: user.id, email: user.email });
    res.json({ token, user: publicUser(user) });
  }),
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) throw new HttpError(404, "Utente non trovato");
    res.json({ user: publicUser(user) });
  }),
);
