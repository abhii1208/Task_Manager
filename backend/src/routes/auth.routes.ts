import { NextFunction, Request, Response, Router } from "express";
import rateLimit from "express-rate-limit";
import passport from "passport";

import { isGoogleOAuthEnabled } from "../config/passport";
import { forgotPassword, login, me, oauthFailure, oauthSuccess, register, resetPassword } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "../schemas/auth.schema";

const authRouter = Router();
const oauthFailurePath = "/api/auth/oauth/failure";

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
    oauthFailure(_req, res);
    return;
  }

  next();
};

authRouter.post("/register", validate(registerSchema), register);
authRouter.post("/login", validate(loginSchema), login);
authRouter.post("/forgot-password", forgotPasswordRateLimiter, validate(forgotPasswordSchema), forgotPassword);
authRouter.post("/reset-password", validate(resetPasswordSchema), resetPassword);

authRouter.get("/google", ensureGoogleOAuthEnabled, (req: Request, res: Response, next: NextFunction) => {
  logOAuth("Starting Google OAuth", { path: req.originalUrl });
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

const ensureOAuthUserPayload = (req: Request, res: Response, next: NextFunction): void => {
  const sessionUser = req.user as { id?: string; email?: string; role?: string } | undefined;

  if (!sessionUser?.id || !sessionUser.email || !sessionUser.role) {
    // eslint-disable-next-line no-console
    console.error("[OAuth][Google] Passport callback returned invalid user payload");
    res.redirect(oauthFailurePath);
    return;
  }

  req.user = {
    id: sessionUser.id,
    email: sessionUser.email,
    role: sessionUser.role
  };

  next();
};

const handleGooglePassportCallback = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate(
    "google",
    {
      session: false,
      failureRedirect: oauthFailurePath
    },
    (error: unknown, user?: unknown, info?: unknown) => {
      if (error) {
        // eslint-disable-next-line no-console
        console.error("[OAuth][Google] Passport callback authentication failed", error);
        res.redirect(oauthFailurePath);
        return;
      }

      if (!user) {
        // eslint-disable-next-line no-console
        console.error("[OAuth][Google] Passport callback did not return a user", info);
        res.redirect(oauthFailurePath);
        return;
      }

      req.user = user as Request["user"];
      ensureOAuthUserPayload(req, res, next);
    }
  )(req, res, next);
};

authRouter.get(
  "/google/callback",
  ensureGoogleOAuthEnabled,
  (req: Request, _res: Response, next: NextFunction) => {
    logOAuth("Google OAuth callback reached", { path: req.originalUrl });
    next();
  },
  handleGooglePassportCallback,
  oauthSuccess
);

authRouter.get("/oauth/failure", oauthFailure);
authRouter.get("/me", authenticate, me);

export default authRouter;
