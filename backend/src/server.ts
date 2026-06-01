import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import session from "express-session";
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

const allowedOrigins = new Set(
  [
    env.CLIENT_URL,
    ...env.CLIENT_URLS,
    "http://localhost:5173",
    "http://localhost:3000"
  ].filter(Boolean)
);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    // eslint-disable-next-line no-console
    console.error(`[CORS] Blocked origin: ${origin}`);
    callback(new Error(`CORS blocked origin: ${origin}`));
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
app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      httpOnly: true,
      maxAge: 10 * 60 * 1000
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());

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

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      success: true,
      status: "ok",
      service: "TaskFlow Pro API",
      message: "TaskFlow Pro API is running",
      timestamp: new Date().toISOString(),
      database: "connected"
    });
  } catch {
    res.status(503).json({
      success: false,
      status: "error",
      service: "TaskFlow Pro API",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      message: "Database connectivity check failed"
    });
  }
});

app.use("/api/auth", authRateLimiter, authRouter);
app.use("/api/tasks", taskRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const startServer = async (): Promise<void> => {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    // eslint-disable-next-line no-console
    console.log("Database connected successfully.");

    app.listen(env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Backend running on http://localhost:${env.PORT}`);
    });
  } catch {
    // eslint-disable-next-line no-console
    console.error("Failed to initialize database connection. Check environment configuration.");
    process.exit(1);
  }
};

void startServer();
