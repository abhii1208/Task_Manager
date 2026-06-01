import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Request, Response } from "express";

import { isSmtpConfigured } from "../config/mail";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { AppError } from "../middleware/error.middleware";
import { sendPasswordResetEmail } from "../services/email.service";
import { asyncHandler } from "../utils/asyncHandler";
import { signToken } from "../utils/jwt";

const userSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
  provider: true,
  role: true,
  createdAt: true,
  updatedAt: true
};

const oauthErrorRedirectUrl = `${env.CLIENT_URL}/#/login?oauthError=google`;
const forgotPasswordMessage = "If an account exists with this email, a reset link has been sent.";

const createResetToken = (): { rawToken: string; tokenHash: string; expiresAt: Date } => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  return { rawToken, tokenHash, expiresAt };
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email.toLowerCase();

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (existingUser) {
    throw new AppError("Email is already in use", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      provider: "credentials"
    },
    select: userSelect
  });

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  res.status(201).json({
    success: true,
    message: "Registration successful",
    data: { user, token }
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user || !user.passwordHash) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        provider: user.provider,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      token
    }
  });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  if (!isSmtpConfigured()) {
    throw new AppError("SMTP is not configured. Please contact administrator.", 500);
  }

  const { email } = req.body as { email: string };
  const normalizedEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      name: true,
      email: true
    }
  });

  if (!user) {
    res.status(200).json({
      success: true,
      message: forgotPasswordMessage,
      data: null
    });
    return;
  }

  const { rawToken, tokenHash, expiresAt } = createResetToken();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: expiresAt
    }
  });

  const resetUrl = `${env.CLIENT_URL}/#/reset-password?token=${rawToken}`;

  res.status(200).json({
    success: true,
    message: forgotPasswordMessage,
    data: null
  });

  setImmediate(() => {
    void (async () => {
      try {
        await sendPasswordResetEmail(user.email, resetUrl, user.name);
        // eslint-disable-next-line no-console
        console.log("[Email] Password reset email sent", { userId: user.id });
      } catch (emailError) {
        // eslint-disable-next-line no-console
        console.error("[Email] Password reset email failed", emailError);
      }
    })();
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body as { token: string; password: string };
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: {
        gt: new Date()
      }
    },
    select: {
      id: true,
      provider: true
    }
  });

  if (!user) {
    throw new AppError("Invalid or expired reset token.", 400);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      provider: user.provider || "credentials",
      resetPasswordTokenHash: null,
      resetPasswordExpires: null
    }
  });

  res.status(200).json({
    success: true,
    message: "Password reset successfully. Please login.",
    data: null
  });
});

export const oauthFailure = (_req: Request, res: Response): void => {
  // eslint-disable-next-line no-console
  console.error("[OAuth][Google] OAuth flow failed, redirecting to login.");
  res.redirect(oauthErrorRedirectUrl);
};

export const me = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: userSelect
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    data: user
  });
});
