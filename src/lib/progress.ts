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

export async function getCompletionStats(userId: string) {
  const ordered = await getFlattenedUnits();
  const completed = await getCompletedUnitIds(userId);
  const total = ordered.length;
  const done = ordered.filter((u) => completed.has(u.id)).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { total, done, percent };
}

export function getRankByPercent(percent: number) {
  if (percent < 35) {
    return {
      title: "Стажёр вайбкодинга",
      praise:
        "Ты уже в игре: формируешь привычку завершать миссии и это важнее скорости.",
    };
  }
  if (percent < 75) {
    return {
      title: "Уверенный вайбкодер",
      praise:
        "Сильный темп: решения становятся системными, а ошибки быстрее превращаются в опыт.",
    };
  }
  return {
    title: "Архитектор вайбкодинга",
    praise:
      "Отличный уровень: ты не просто делаешь макеты, ты строишь работающий продуктовый контур.",
  };
}

export async function getSubmissionInsights(userId: string) {
  const recent = await prisma.unitSubmission.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 12,
    select: {
      id: true,
      unitId: true,
      score: true,
      passed: true,
      feedback: true,
      issuesJson: true,
      createdAt: true,
    },
  });

  const issueCounts = new Map<string, number>();
  for (const attempt of recent) {
    let issues: string[] = [];
    try {
      issues = JSON.parse(attempt.issuesJson) as string[];
    } catch {
      issues = [];
    }
    for (const item of issues) {
      issueCounts.set(item, (issueCounts.get(item) ?? 0) + 1);
    }
  }

  const topIssues = [...issueCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([issue, count]) => ({ issue, count }));

  return { recent, topIssues };
}

export async function getStudentsOverview() {
  const students = await prisma.user.findMany({
    where: { role: "student" },
    select: { id: true, slug: true, displayName: true },
    orderBy: { displayName: "asc" },
  });

  const ordered = await getFlattenedUnits();
  const total = ordered.length;

  const result: Array<{
    id: string;
    slug: string;
    displayName: string;
    done: number;
    total: number;
    percent: number;
  }> = [];

  for (const student of students) {
    const done = await prisma.unitProgress.count({
      where: { userId: student.id },
    });
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    result.push({
      id: student.id,
      slug: student.slug,
      displayName: student.displayName,
      done,
      total,
      percent,
    });
  }

  return result;
}
