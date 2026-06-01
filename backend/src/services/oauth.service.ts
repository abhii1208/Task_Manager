import { prisma } from "../config/prisma";

type ResolveGoogleOAuthUserInput = {
  googleId: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
};

const oauthUserSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
  googleId: true,
  provider: true,
  role: true
};

const logOAuth = (message: string, details?: Record<string, unknown>): void => {
  // eslint-disable-next-line no-console
  console.info(
    `[OAuth][Google] ${message}${details ? ` ${JSON.stringify(details)}` : ""}`
  );
};

const getDisplayName = (name: string | null | undefined, normalizedEmail: string): string => {
  const trimmed = name?.trim();

  if (trimmed) {
    return trimmed;
  }

  return normalizedEmail.split("@")[0] ?? "TaskFlow User";
};

export const resolveGoogleOAuthUser = async ({
  googleId,
  email,
  name,
  avatarUrl
}: ResolveGoogleOAuthUserInput) => {
  const normalizedEmail = email.trim().toLowerCase();
  const displayName = getDisplayName(name, normalizedEmail);

  const existingByGoogleId = await prisma.user.findUnique({
    where: { googleId },
    select: oauthUserSelect
  });

  if (existingByGoogleId) {
    logOAuth("User lookup result", {
      strategy: "found_by_googleId",
      userId: existingByGoogleId.id
    });
    return prisma.user.update({
      where: { id: existingByGoogleId.id },
      data: {
        name: displayName,
        avatarUrl: avatarUrl ?? existingByGoogleId.avatarUrl,
        provider: "google"
      },
      select: oauthUserSelect
    });
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: oauthUserSelect
  });

  if (existingByEmail) {
    logOAuth("User lookup result", {
      strategy: "found_by_email",
      userId: existingByEmail.id
    });
    return prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        name: existingByEmail.name || displayName,
        avatarUrl: existingByEmail.avatarUrl ?? avatarUrl ?? undefined,
        provider: "google",
        googleId: existingByEmail.googleId ?? googleId
      },
      select: oauthUserSelect
    });
  }

  logOAuth("User lookup result", { strategy: "created_new_user" });
  return prisma.user.create({
    data: {
      name: displayName,
      email: normalizedEmail,
      avatarUrl: avatarUrl ?? undefined,
      provider: "google",
      googleId
    },
    select: oauthUserSelect
  });
};
