import cors from "cors";
import express from "express";
import type { Request, Response } from "express";
import type { CorsOptions } from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import passport from "passport";

import { env } from "./config/env";
import { initializePassport } from "./config/passport";
import { prisma } from "./config/prisma";
import { errorMiddleware, notFoundMiddleware } from "./middleware/error.middleware";
import authRouter from "./routes/auth.routes";
import taskRouter from "./routes/task.routes";

const app = express();

app.set("trust proxy", 1);
initializePassport();

const defaultAllowedOrigins = [
  env.CLIENT_URL,
  "https://task-manager-ks8m.vercel.app",
  "https://task-manager-8rvp.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000"
].filter(Boolean) as string[];

const allowedOrigins = new Set([...defaultAllowedOrigins, ...env.CLIENT_URLS].map((origin) => origin.replace(/\/+$/, "")));

const isAllowedVercelOrigin = (origin: string): boolean => {
  try {
    const { hostname, protocol } = new URL(origin);
    return protocol === "https:" && hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
};

const isCorsOriginAllowed = (origin?: string): boolean => {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = origin.replace(/\/+$/, "");
  return allowedOrigins.has(normalizedOrigin) || isAllowedVercelOrigin(normalizedOrigin);
};

// eslint-disable-next-line no-console
console.log("[Env] CLIENT_URL configured:", Boolean(env.CLIENT_URL));
// eslint-disable-next-line no-console
console.log("[Env] CLIENT_URLS configured:", env.CLIENT_URLS.length);
// eslint-disable-next-line no-console
console.log("[Env] DATABASE_URL configured:", Boolean(env.DATABASE_URL));
// eslint-disable-next-line no-console
console.log(
  "[Env] SMTP configured:",
  Boolean(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS && env.SMTP_FROM)
);
// eslint-disable-next-line no-console
console.log(
  "[Env] GOOGLE configured:",
  Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_CALLBACK_URL)
);

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback) => {
    if (isCorsOriginAllowed(origin)) {
      callback(null, true);
      return;
    }

    // eslint-disable-next-line no-console
    console.error(`[CORS] Blocked origin: ${origin}`);
    callback(null, false);
  },
  credentials: true
};

app.options("*", cors(corsOptions));
app.use(
  cors(corsOptions)
);
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 150,
    standardHeaders: "draft-7",
    legacyHeaders: false
  })
);
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 25,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later."
  }
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: "ok",
    message: "TaskFlow Pro API is running",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health/db", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      success: true,
      status: "ok",
      message: "Database connection is healthy"
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Database connection failed"
    });
  }
});

app.use("/api/auth", authRateLimiter, authRouter);
app.use("/api/tasks", taskRouter);
app.use("/auth", authRateLimiter, authRouter);
app.use("/tasks", taskRouter);
// eslint-disable-next-line no-console
console.log("[Server] Auth routes mounted at /api/auth");
// eslint-disable-next-line no-console
console.log("[Server] Task routes mounted at /api/tasks");
// eslint-disable-next-line no-console
console.log("[Server] Compatibility auth routes mounted at /auth");
// eslint-disable-next-line no-console
console.log("[Server] Compatibility task routes mounted at /tasks");

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const logInitialDatabaseConnection = async (): Promise<void> => {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    // eslint-disable-next-line no-console
    console.log("[Database] Connected successfully");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[Database] Initial connection failed");

    if (error instanceof Error) {
      // eslint-disable-next-line no-console
      console.error("[Database] Error name:", error.name);
      // eslint-disable-next-line no-console
      console.error("[Database] Error message:", error.message);
    }

    // eslint-disable-next-line no-console
    console.error("[Database] DATABASE_URL configured:", Boolean(process.env.DATABASE_URL));
    // eslint-disable-next-line no-console
    console.error("[Database] NODE_ENV:", process.env.NODE_ENV);
  }
};

const startServer = (): void => {
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[Server] Running on port ${env.PORT}`);
  });

  void logInitialDatabaseConnection();
};

startServer();
