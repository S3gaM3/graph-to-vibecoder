import * as bcrypt from "bcrypt";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getIronSessionOptions, type SessionPayload } from "@/lib/session";

export async function getSession() {
  return getIronSession<SessionPayload>(
    await cookies(),
    getIronSessionOptions(),
  );
}

export async function login(slug: string, password: string): Promise<boolean> {
  const normalized = slug.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { slug: normalized } });
  if (!user) return false;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return false;

  const session = await getSession();
  session.userId = user.id;
  session.slug = user.slug;
  session.displayName = user.displayName;
  session.isLoggedIn = true;
  await session.save();
  return true;
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  await session.save();
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, slug: true, displayName: true },
  });
  return user;
}
