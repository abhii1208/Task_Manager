import nodemailer, { Transporter } from "nodemailer";

import { env } from "./env";
import { AppError } from "../middleware/error.middleware";

const SMTP_NOT_CONFIGURED_MESSAGE = "SMTP is not configured. Please contact administrator.";

export const isSmtpConfigured = (): boolean => {
  return Boolean(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS && env.SMTP_FROM);
};

export const createMailTransporter = (): Transporter => {
  if (!isSmtpConfigured()) {
    throw new AppError(SMTP_NOT_CONFIGURED_MESSAGE, 500);
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });
};

export const getSmtpFromAddress = (): string => {
  if (!env.SMTP_FROM) {
    throw new AppError(SMTP_NOT_CONFIGURED_MESSAGE, 500);
  }

  return env.SMTP_FROM;
};
