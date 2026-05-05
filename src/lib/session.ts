import type { SessionOptions } from "iron-session";

export type SessionPayload = {
  userId?: string;
  slug?: string;
  displayName?: string;
  role?: string;
  isLoggedIn?: boolean;
};

export const defaultSession: SessionPayload = {
  userId: "",
  slug: "",
  displayName: "",
  role: "",
  isLoggedIn: false,
};

function sessionPassword(): string {
  const p = process.env.SESSION_SECRET;
  if (!p || p.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters.");
  }
  return p;
}

export function getIronSessionOptions(): SessionOptions {
  const secureEnv = process.env.COOKIE_SECURE;
  const secure =
    secureEnv !== undefined
      ? secureEnv === "true"
      : process.env.NODE_ENV === "production";

  return {
    cookieName: "vibecoder_session",
    password: sessionPassword(),
    cookieOptions: {
      secure,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 24 * 60 * 60,
      path: "/",
    },
  };
}
