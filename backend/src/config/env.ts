import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().trim().min(1).optional(),
  DB_HOST: z.string().trim().min(1).optional(),
  DB_PORT: z.coerce.number().int().positive().optional(),
  DB_NAME: z.string().trim().min(1).optional(),
  DB_USER: z.string().trim().min(1).optional(),
  DB_PASSWORD: z.string().trim().min(1).optional(),
  DB_SSL: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  BACKEND_URL: z.string().url().default("http://localhost:5000"),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  CLIENT_URLS: z.string().trim().optional(),
  GOOGLE_CLIENT_ID: z.string().trim().optional(),
  GOOGLE_CLIENT_SECRET: z.string().trim().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),
  SMTP_HOST: z.string().trim().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_SECURE: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  SMTP_USER: z.string().trim().optional(),
  SMTP_PASS: z.string().trim().optional(),
  SMTP_FROM: z.string().trim().optional()
});

const sanitizeOptional = (value?: string): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const parseOptionalUrlList = (value?: string): string[] => {
  const trimmed = value?.trim();

  if (!trimmed) {
    return [];
  }

  return trimmed
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
};

const buildDatabaseUrlFromParts = (values: {
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_SSL: boolean;
}): string => {
  const user = encodeURIComponent(values.DB_USER);
  const password = encodeURIComponent(values.DB_PASSWORD);
  const baseUrl = `postgresql://${user}:${password}@${values.DB_HOST}:${values.DB_PORT}/${values.DB_NAME}`;
  return values.DB_SSL ? `${baseUrl}?sslmode=require` : baseUrl;
};

const applySslToConnectionString = (databaseUrl: string, shouldUseSsl: boolean): string => {
  if (!shouldUseSsl) {
    return databaseUrl;
  }

  try {
    const parsed = new URL(databaseUrl);

    if (!parsed.searchParams.has("sslmode")) {
      parsed.searchParams.set("sslmode", "require");
    }

    return parsed.toString();
  } catch {
    return databaseUrl;
  }
};

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const errors = parsedEnv.error.flatten().fieldErrors;
  throw new Error(`Invalid environment variables: ${JSON.stringify(errors)}`);
}

const rawEnv = parsedEnv.data;
const dbSsl = rawEnv.DB_SSL ?? false;
const hasDatabaseParts =
  Boolean(rawEnv.DB_HOST) &&
  Boolean(rawEnv.DB_PORT) &&
  Boolean(rawEnv.DB_NAME) &&
  Boolean(rawEnv.DB_USER) &&
  Boolean(rawEnv.DB_PASSWORD);

let databaseUrl = rawEnv.DATABASE_URL;

if (!databaseUrl && hasDatabaseParts) {
  databaseUrl = buildDatabaseUrlFromParts({
    DB_HOST: rawEnv.DB_HOST as string,
    DB_PORT: rawEnv.DB_PORT as number,
    DB_NAME: rawEnv.DB_NAME as string,
    DB_USER: rawEnv.DB_USER as string,
    DB_PASSWORD: rawEnv.DB_PASSWORD as string,
    DB_SSL: dbSsl
  });
}

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required. Provide DATABASE_URL or provide DB_HOST, DB_PORT, DB_NAME, DB_USER, and DB_PASSWORD."
  );
}

const resolvedDatabaseUrl = applySslToConnectionString(databaseUrl, dbSsl);
process.env.DATABASE_URL = resolvedDatabaseUrl;

const googleClientId = sanitizeOptional(rawEnv.GOOGLE_CLIENT_ID);
const googleClientSecret = sanitizeOptional(rawEnv.GOOGLE_CLIENT_SECRET);
const smtpHost = sanitizeOptional(rawEnv.SMTP_HOST);
const smtpUser = sanitizeOptional(rawEnv.SMTP_USER);
const smtpPass = sanitizeOptional(rawEnv.SMTP_PASS);
const smtpFrom = sanitizeOptional(rawEnv.SMTP_FROM);
const smtpSecure = rawEnv.SMTP_SECURE ?? false;
const clientUrls = parseOptionalUrlList(rawEnv.CLIENT_URLS);

const googleCallbackUrl = rawEnv.GOOGLE_CALLBACK_URL ?? `${rawEnv.BACKEND_URL}/api/auth/google/callback`;

export const env = {
  ...rawEnv,
  DATABASE_URL: resolvedDatabaseUrl,
  DB_SSL: dbSsl,
  GOOGLE_CLIENT_ID: googleClientId,
  GOOGLE_CLIENT_SECRET: googleClientSecret,
  GOOGLE_CALLBACK_URL: googleCallbackUrl,
  SMTP_HOST: smtpHost,
  SMTP_PORT: rawEnv.SMTP_PORT,
  SMTP_SECURE: smtpSecure,
  SMTP_USER: smtpUser,
  SMTP_PASS: smtpPass,
  SMTP_FROM: smtpFrom,
  CLIENT_URLS: clientUrls
};
