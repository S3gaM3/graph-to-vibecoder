import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-user";

const putSchema = z.object({
  whoNow: z.string(),
  whoBecome: z.string(),
  obstacle: z.string(),
});

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const row = await prisma.manifest.findUnique({ where: { userId } });
  return NextResponse.json({
    whoNow: row?.whoNow ?? "",
    whoBecome: row?.whoBecome ?? "",
    obstacle: row?.obstacle ?? "",
  });
}

export async function PUT(request: Request) {
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

  const parsed = putSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await prisma.manifest.upsert({
    where: { userId },
    create: {
      userId,
      whoNow: parsed.data.whoNow,
      whoBecome: parsed.data.whoBecome,
      obstacle: parsed.data.obstacle,
    },
    update: {
      whoNow: parsed.data.whoNow,
      whoBecome: parsed.data.whoBecome,
      obstacle: parsed.data.obstacle,
    },
  });

  return NextResponse.json({ ok: true });
}
