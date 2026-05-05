import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

export type CurriculumUnit = {
  id: string;
  title: string;
};

export type CurriculumModule = {
  id: string;
  title: string;
  units: CurriculumUnit[];
};

export type CurriculumFile = {
  title: string;
  modules: CurriculumModule[];
};

let cached: CurriculumFile | null = null;

export async function getCurriculum(): Promise<CurriculumFile> {
  if (cached) return cached;
  const root = process.cwd();
  const raw = await readFile(
    path.join(root, "content", "curriculum.json"),
    "utf8",
  );
  cached = JSON.parse(raw) as CurriculumFile;
  return cached;
}

export async function getFlattenedUnits(): Promise<
  Array<CurriculumUnit & { moduleId: string; moduleTitle: string }>
> {
  const cur = await getCurriculum();
  const out: Array<
    CurriculumUnit & { moduleId: string; moduleTitle: string }
  > = [];
  for (const m of cur.modules) {
    for (const u of m.units) {
      out.push({
        ...u,
        moduleId: m.id,
        moduleTitle: m.title,
      });
    }
  }
  return out;
}

export async function getUnitMeta(unitId: string) {
  const flat = await getFlattenedUnits();
  return flat.find((u) => u.id === unitId) ?? null;
}
