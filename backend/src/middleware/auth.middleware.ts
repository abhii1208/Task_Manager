import { NextFunction, Request, Response } from "express";

import { AppError } from "./error.middleware";
import { JwtUserPayload, verifyToken } from "../utils/jwt";

export type AuthenticatedRequest = Request & {
  user?: JwtUserPayload;
};

export const authenticate = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    next(new AppError("Authentication token is missing", 401));
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
};