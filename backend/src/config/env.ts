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
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters").optional(),
  SMTP_HOST: z.string().trim().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_SECURE: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  SMTP_USER: z.string().trim().optional(),
  SMTP_PASS: z.string().trim().optional(),
  SMTP_FROM: z.string().trim().optional(),
  SMTP_TEST_SECRET: z.string().trim().optional(),
  TEST_SECRET: z.string().trim().optional()
});

const stripWrappingQuotes = (value: string): string => {
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1).trim();
  }

  return value;
};

const sanitizeOptional = (value?: string): string | undefined => {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  const normalized = stripWrappingQuotes(trimmed);
  return normalized ? normalized : undefined;
};

const normalizeSmtpPass = (value?: string): string | undefined => {
  const sanitized = sanitizeOptional(value);

  if (!sanitized) {
    return undefined;
  }

  // Gmail app passwords are often copied as groups with spaces.
  return sanitized.replace(/\s+/g, "");
};

const normalizeSmtpFrom = (value?: string): string | undefined => {
  const sanitized = sanitizeOptional(value);

  if (!sanitized) {
    return undefined;
  }

  const markdownMailToMatch = sanitized.match(/^(.+?)\s*\[([^\]]+)\]\(mailto:[^)]+\)$/i);

  if (markdownMailToMatch) {
    const displayName = markdownMailToMatch[1].trim();
    const email = markdownMailToMatch[2].trim();
    return `${displayName} <${email}>`;
  }

  const plainMailToMatch = sanitized.match(/^mailto:(.+)$/i);

  if (plainMailToMatch) {
    return plainMailToMatch[1].trim();
  }

  return sanitized;
};

const parseOptionalUrlList = (value?: string): string[] => {
  const trimmed = value?.trim();

  if (!trimmed) {
    return [];
  }

  return trimmed
    .split(",")
    .map((entry) => stripWrappingQuotes(entry.trim()).replace(/\/+$/, ""))
    .filter((entry) => entry.length > 0);
};

const normalizeDatabaseConnectionString = (databaseUrl: string, nodeEnv: string, shouldUseSsl: boolean): string => {
  try {
    const parsed = new URL(databaseUrl);
    const isPostgresProtocol = parsed.protocol === "postgresql:" || parsed.protocol === "postgres:";

    if (!isPostgresProtocol) {
      return databaseUrl;
    }

    const isSupabaseHost = parsed.hostname.includes("supabase.com");
    const shouldRequireSsl = shouldUseSsl || nodeEnv === "production" || isSupabaseHost;

    if (shouldRequireSsl && !parsed.searchParams.has("sslmode")) {
      parsed.searchParams.set("sslmode", "require");
    }

    const isSupabasePooler = parsed.hostname.includes("pooler.supabase.com");
    const isTransactionPoolerPort = parsed.port === "6543";

    if (isSupabasePooler && isTransactionPoolerPort && !parsed.searchParams.has("pgbouncer")) {
      parsed.searchParams.set("pgbouncer", "true");
    }

    return parsed.toString();
  } catch {
    return databaseUrl;
  }
};

export const getDatabaseConnectionSummary = (databaseUrl: string): Record<string, string | number | boolean | undefined> => {
  try {
    const parsed = new URL(databaseUrl);
    const username = decodeURIComponent(parsed.username);
    const projectRefMatch = username.match(/^[^.]+\.([a-z0-9]{20})$/i);

    return {
      protocol: parsed.protocol.replace(":", ""),
      username,
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : undefined,
      database: parsed.pathname.replace(/^\//, ""),
      sslmode: parsed.searchParams.get("sslmode") ?? undefined,
      pgbouncer: parsed.searchParams.get("pgbouncer") ?? undefined,
      isSupabasePooler: parsed.hostname.includes("pooler.supabase.com"),
      isSupabaseDirect: parsed.hostname.startsWith("db.") && parsed.hostname.endsWith(".supabase.co"),
      projectRef: projectRefMatch?.[1]
    };
  } catch {
    return {
      parseable: false
    };
  }
};

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const errors = parsedEnv.error.flatten().fieldErrors;
  throw new Error(`Invalid environment variables: ${JSON.stringify(errors)}`);
}

const rawEnv = parsedEnv.data;
const dbSsl = rawEnv.DB_SSL ?? false;
const databaseUrl = sanitizeOptional(rawEnv.DATABASE_URL);

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

const resolvedDatabaseUrl = normalizeDatabaseConnectionString(databaseUrl, rawEnv.NODE_ENV, dbSsl);
process.env.DATABASE_URL = resolvedDatabaseUrl;

const googleClientId = sanitizeOptional(rawEnv.GOOGLE_CLIENT_ID);
const googleClientSecret = sanitizeOptional(rawEnv.GOOGLE_CLIENT_SECRET);
const smtpHost = sanitizeOptional(rawEnv.SMTP_HOST);
const smtpUser = sanitizeOptional(rawEnv.SMTP_USER);
const smtpPass = normalizeSmtpPass(rawEnv.SMTP_PASS);
const smtpFrom = normalizeSmtpFrom(rawEnv.SMTP_FROM);
const smtpTestSecret = sanitizeOptional(rawEnv.TEST_SECRET ?? rawEnv.SMTP_TEST_SECRET);
const smtpSecure = rawEnv.SMTP_SECURE ?? false;
const clientUrls = parseOptionalUrlList(rawEnv.CLIENT_URLS);

const googleCallbackUrl = rawEnv.GOOGLE_CALLBACK_URL ?? `${rawEnv.BACKEND_URL}/api/auth/google/callback`;

export const env = {
  ...rawEnv,
  BACKEND_URL: rawEnv.BACKEND_URL.replace(/\/+$/, ""),
  CLIENT_URL: rawEnv.CLIENT_URL.replace(/\/+$/, ""),
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
  TEST_SECRET: smtpTestSecret,
  SMTP_TEST_SECRET: smtpTestSecret,
  CLIENT_URLS: clientUrls
};
