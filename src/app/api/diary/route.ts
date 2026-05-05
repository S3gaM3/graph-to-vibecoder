import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-user";

const postSchema = z.object({
  body: z.string().min(1),
  unitId: z.string().optional(),
});

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.diaryEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  return NextResponse.json({ entries: rows });
}

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

  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const created = await prisma.diaryEntry.create({
    data: {
      userId,
      body: parsed.data.body,
      unitId: parsed.data.unitId ?? null,
    },
  });

  return NextResponse.json({ entry: created });
}
