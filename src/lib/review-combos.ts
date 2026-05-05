import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

type Combo = {
  sequence: string[];
  distractors: string[];
};

type ComboFile = {
  default: Combo;
  units: Record<string, Partial<Combo>>;
};

let cache: ComboFile | null = null;

async function loadComboFile(): Promise<ComboFile> {
  if (cache) return cache;
  const raw = await readFile(
    path.join(process.cwd(), "content", "review-combos.json"),
    "utf8",
  );
  cache = JSON.parse(raw) as ComboFile;
  return cache;
}

export async function getReviewCombo(unitId: string): Promise<Combo> {
  const file = await loadComboFile();
  const unit = file.units[unitId] ?? {};
  return {
    sequence: unit.sequence ?? file.default.sequence,
    distractors: unit.distractors ?? file.default.distractors,
  };
}
