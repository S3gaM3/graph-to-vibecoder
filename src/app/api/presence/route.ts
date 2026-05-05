import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/api-user";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  currentUnitId: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      lastSeenAt: new Date(),
      currentUnitId: parsed.data.currentUnitId ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
