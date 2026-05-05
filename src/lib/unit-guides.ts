import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

type Guide = {
  questions: string[];
  doneCriteria: string[];
};

type GuideFile = {
  default: Guide;
  units: Record<string, Partial<Guide>>;
};

let cache: GuideFile | null = null;

async function getGuideFile(): Promise<GuideFile> {
  if (cache) return cache;
  const raw = await readFile(
    path.join(process.cwd(), "content", "unit-guides.json"),
    "utf8",
  );
  cache = JSON.parse(raw) as GuideFile;
  return cache;
}

export async function getUnitGuide(unitId: string): Promise<Guide> {
  const file = await getGuideFile();
  const override = file.units[unitId] ?? {};
  return {
    questions: override.questions ?? file.default.questions,
    doneCriteria: override.doneCriteria ?? file.default.doneCriteria,
  };
}
