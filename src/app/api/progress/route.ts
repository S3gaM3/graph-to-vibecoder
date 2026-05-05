import { NextResponse } from "next/server";
import { z } from "zod";
import { getFlattenedUnits } from "@/lib/curriculum";
import { getUnitState, markUnitDone } from "@/lib/progress";
import { requireUserId } from "@/lib/api-user";

const postSchema = z.object({
  unitId: z.string().min(1),
  notes: z.string().optional(),
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

  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const flat = await getFlattenedUnits();
  const known = flat.some((u) => u.id === parsed.data.unitId);
  if (!known) {
    return NextResponse.json({ error: "Unknown unit" }, { status: 404 });
  }

  const state = await getUnitState(userId, parsed.data.unitId);
  if (state === "locked") {
    return NextResponse.json({ error: "Unit locked" }, { status: 403 });
  }

  await markUnitDone(userId, parsed.data.unitId, parsed.data.notes);

  return NextResponse.json({ ok: true });
}
