import { getSession } from "@/lib/auth";

export async function requireUserId(): Promise<string | null> {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) return null;
  return session.userId;
}
