import nodemailer, { Transporter } from "nodemailer";

import { env } from "./env";

let transporterInstance: Transporter | null = null;

export const isSmtpConfigured = (): boolean => {
  return Boolean(
    env.SMTP_HOST &&
    env.SMTP_PORT &&
    env.SMTP_USER &&
    env.SMTP_PASS &&
    env.SMTP_FROM
  );
};

export const createMailTransporter = (): Transporter => {
  if (!isSmtpConfigured()) {
    throw new Error("SMTP is not configured.");
  }

  if (transporterInstance) {
    return transporterInstance;
  }

  transporterInstance = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    secure: env.SMTP_SECURE === true,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000
  });

  return transporterInstance;
};

export const getSmtpFromAddress = (): string => {
  if (!env.SMTP_FROM) {
    throw new Error("SMTP is not configured.");
  }

  return env.SMTP_FROM;
};
