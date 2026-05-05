import "server-only";

import { prisma } from "@/lib/prisma";
import { getFlattenedUnits } from "@/lib/curriculum";

export type UnitState = "locked" | "available" | "done";

export async function getCompletedUnitIds(userId: string): Promise<Set<string>> {
  const rows = await prisma.unitProgress.findMany({
    where: { userId },
    select: { unitId: true },
  });
  return new Set(rows.map((r) => r.unitId));
}

export async function getUnitState(
  userId: string,
  unitId: string,
): Promise<UnitState> {
  const ordered = await getFlattenedUnits();
  const completed = await getCompletedUnitIds(userId);
  const idx = ordered.findIndex((u) => u.id === unitId);
  if (idx === -1) return "locked";
  if (completed.has(unitId)) return "done";
  if (idx === 0) return "available";
  const prevId = ordered[idx - 1]?.id;
  if (prevId && completed.has(prevId)) return "available";
  return "locked";
}

export async function getAllUnitStates(userId: string) {
  const ordered = await getFlattenedUnits();
  const completed = await getCompletedUnitIds(userId);
  const states: Record<string, UnitState> = {};
  for (let i = 0; i < ordered.length; i++) {
    const id = ordered[i].id;
    if (completed.has(id)) {
      states[id] = "done";
    } else if (i === 0 || completed.has(ordered[i - 1].id)) {
      states[id] = "available";
    } else {
      states[id] = "locked";
    }
  }
  return states;
}

export async function markUnitDone(userId: string, unitId: string, notes?: string) {
  await prisma.unitProgress.upsert({
    where: {
      userId_unitId: { userId, unitId },
    },
    create: {
      userId,
      unitId,
      notes: notes ?? null,
    },
    update: {
      notes: notes ?? null,
      completedAt: new Date(),
    },
  });
}
