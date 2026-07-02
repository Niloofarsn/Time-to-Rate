import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/http";
import { verifyToken, type JwtPayload } from "../lib/auth";

// Augment Express Request with the authenticated user.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new HttpError(401, "Autenticazione richiesta");
  }
  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch {
    throw new HttpError(401, "Token non valido o scaduto");
  }
}
