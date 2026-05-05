import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/api-user";
import { prisma } from "@/lib/prisma";
import { getFlattenedUnits } from "@/lib/curriculum";
import { reviewSubmission } from "@/lib/review";
import { getUnitState, markUnitDone } from "@/lib/progress";

const postSchema = z.object({
  unitId: z.string().min(1),
  answer: z.string().min(1),
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

  const known = (await getFlattenedUnits()).some((u) => u.id === parsed.data.unitId);
  if (!known) {
    return NextResponse.json({ error: "Unknown unit" }, { status: 404 });
  }

  const result = await reviewSubmission(parsed.data.unitId, parsed.data.answer);

  await prisma.unitSubmission.create({
    data: {
      userId,
      unitId: parsed.data.unitId,
      answer: parsed.data.answer,
      score: result.score,
      passed: result.passed,
      feedback: result.feedback,
      issuesJson: JSON.stringify(result.issues),
      improvementsJson: JSON.stringify(result.improvements),
    },
  });

  if (result.passed) {
    const state = await getUnitState(userId, parsed.data.unitId);
    if (state !== "locked") {
      await markUnitDone(userId, parsed.data.unitId, "Автозачёт после проверки.");
    }
  }

  return NextResponse.json(result);
}
