import { NextFunction, Request, Response, Router } from "express";
import rateLimit from "express-rate-limit";
import passport from "passport";

import { env } from "../config/env";
import { isGoogleOAuthEnabled } from "../config/passport";
import { forgotPassword, login, me, oauthFailure, register, resetPassword, testSmtp } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema, testSmtpSchema } from "../schemas/auth.schema";
import { signToken } from "../utils/jwt";

const authRouter = Router();
const oauthFailurePath = `${env.CLIENT_URL}/#/login?oauthError=google`;

const logOAuth = (message: string, details?: Record<string, unknown>): void => {
  // eslint-disable-next-line no-console
  console.info(
    `[OAuth][Google] ${message}${details ? ` ${JSON.stringify(details)}` : ""}`
  );
};

const forgotPasswordRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many password reset requests. Please try again later."
  }
});

const ensureGoogleOAuthEnabled = (_req: Request, res: Response, next: NextFunction): void => {
  if (!isGoogleOAuthEnabled()) {
    // eslint-disable-next-line no-console
    console.error("[OAuth][Google] OAuth is disabled due to missing Google OAuth environment variables.");
    res.status(503).json({
      success: false,
      message: "Google OAuth is not configured."
    });
    return;
  }

  next();
};

const ensureSmtpTestAccess = (req: Request, res: Response, next: NextFunction): void => {
  if (env.NODE_ENV !== "production") {
    next();
    return;
  }

  if (!env.SMTP_TEST_SECRET) {
    res.status(503).json({
      success: false,
      message: "SMTP test endpoint is disabled in production.",
      error: "SMTP_TEST_SECRET is not configured."
    });
    return;
  }

  const testSecret = req.header("x-test-secret");

  if (testSecret !== env.SMTP_TEST_SECRET) {
    res.status(403).json({
      success: false,
      message: "Forbidden",
      error: "Invalid test secret."
    });
    return;
  }

  next();
};

authRouter.post("/register", validate(registerSchema), register);
authRouter.post("/login", validate(loginSchema), login);
authRouter.post("/forgot-password", forgotPasswordRateLimiter, validate(forgotPasswordSchema), forgotPassword);
authRouter.post("/reset-password", validate(resetPasswordSchema), resetPassword);
authRouter.post("/test-smtp", ensureSmtpTestAccess, validate(testSmtpSchema), testSmtp);

authRouter.get("/google", ensureGoogleOAuthEnabled, (req: Request, res: Response, next: NextFunction) => {
  logOAuth("Starting Google OAuth", { path: req.originalUrl });
  return passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    prompt: "select_account"
  })(req, res, next);
});

authRouter.get(
  "/google/callback",
  ensureGoogleOAuthEnabled,
  (req: Request, res: Response, next: NextFunction) => {
    logOAuth("Google OAuth callback reached", { path: req.originalUrl });
    passport.authenticate(
      "google",
      {
        session: false,
        failureRedirect: oauthFailurePath
      },
      async (error: unknown, user?: unknown) => {
        try {
          if (error || !user) {
            // eslint-disable-next-line no-console
            console.error("[OAuth][Google] Callback failed", error);
            res.redirect(oauthFailurePath);
            return;
          }

          const oauthUser = user as { id?: string; email?: string; role?: string };

          if (!oauthUser.id || !oauthUser.email || !oauthUser.role) {
            // eslint-disable-next-line no-console
            console.error("[OAuth][Google] Callback returned invalid user payload");
            res.redirect(oauthFailurePath);
            return;
          }

          const token = signToken({
            id: oauthUser.id,
            email: oauthUser.email,
            role: oauthUser.role
          });

          logOAuth("JWT generated", { userId: oauthUser.id });

          const redirectUrl = `${env.CLIENT_URL}/#/oauth/callback?token=${encodeURIComponent(token)}`;

          logOAuth("Redirecting to frontend callback", {
            redirectPath: `${env.CLIENT_URL}/#/oauth/callback`
          });

          res.redirect(redirectUrl);
        } catch (callbackError) {
          // eslint-disable-next-line no-console
          console.error("[OAuth][Google] JWT redirect failed", callbackError);
          res.redirect(oauthFailurePath);
        }
      }
    )(req, res, next);
  }
);

authRouter.get("/oauth/failure", oauthFailure);
authRouter.get("/me", authenticate, me);

export default authRouter;
