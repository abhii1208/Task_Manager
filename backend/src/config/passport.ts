import passport from "passport";
import { Profile as GoogleProfile, Strategy as GoogleStrategy } from "passport-google-oauth20";

import { env } from "./env";
import { prisma } from "./prisma";
import { resolveGoogleOAuthUser } from "../services/oauth.service";

type SessionUser = {
  id: string;
  email: string;
  role: string;
};

const toSessionUser = (user: { id: string; email: string; role: string }): SessionUser => ({
  id: user.id,
  email: user.email,
  role: user.role
});

const googleConfigured = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_CALLBACK_URL);

let isInitialized = false;

const logOAuth = (message: string, details?: Record<string, unknown>): void => {
  // eslint-disable-next-line no-console
  console.info(
    `[OAuth][Google] ${message}${details ? ` ${JSON.stringify(details)}` : ""}`
  );
};

export const initializePassport = (): void => {
  if (isInitialized) {
    return;
  }

  passport.serializeUser((user, done) => {
    done(null, (user as SessionUser).id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          role: true
        }
      });

      if (!user) {
        done(null, false);
        return;
      }

      done(null, toSessionUser(user));
    } catch (error) {
      done(error as Error);
    }
  });

  if (googleConfigured) {
    logOAuth("Google strategy initialized", { callbackURL: env.GOOGLE_CALLBACK_URL });

    passport.use(
      new GoogleStrategy(
        {
          clientID: env.GOOGLE_CLIENT_ID as string,
          clientSecret: env.GOOGLE_CLIENT_SECRET as string,
          callbackURL: env.GOOGLE_CALLBACK_URL
        },
        async (_accessToken, _refreshToken, profile: GoogleProfile, done) => {
          try {
            logOAuth("Google OAuth callback reached", { profileId: profile.id });
            const email = profile.emails?.[0]?.value?.trim().toLowerCase();
            logOAuth("Profile email presence checked", { hasEmail: Boolean(email) });

            if (!email) {
              done(new Error("Google account email is required."));
              return;
            }

            const user = await resolveGoogleOAuthUser({
              googleId: profile.id,
              email,
              name: profile.displayName,
              avatarUrl: profile.photos?.[0]?.value
            });

            done(null, toSessionUser(user));
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error("[OAuth][Google] Strategy callback failed", error);
            done(error as Error);
          }
        }
      )
    );
  } else {
    // eslint-disable-next-line no-console
    console.warn("Google OAuth is disabled. Missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_CALLBACK_URL.");
  }

  isInitialized = true;
};

export const isGoogleOAuthEnabled = (): boolean => googleConfigured;
