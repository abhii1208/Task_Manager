import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const notFoundMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.flatten()
    });
    return;
  }

  if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
    res.status(409).json({
      success: false,
      message: "Unique constraint violation"
    });
    return;
  }

  if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") {
    res.status(404).json({
      success: false,
      message: "Resource not found"
    });
    return;
  }

  const appError = error instanceof AppError ? error : new AppError("Internal server error", 500);

  res.status(appError.statusCode).json({
    success: false,
    message: appError.message,
    ...(appError.details ? { details: appError.details } : {})
  });
};
