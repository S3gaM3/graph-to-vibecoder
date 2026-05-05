import "server-only";

import { readFile } from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";

type TutorHints = Record<string, string>;

let cached: TutorHints | null = null;

export async function getTutorHint(unitId: string): Promise<string | null> {
  if (!cached) {
    const p = path.join(process.cwd(), "content", "tutor-hints.json");
    if (!fs.existsSync(p)) return null;
    const raw = await readFile(p, "utf8");
    cached = JSON.parse(raw) as TutorHints;
  }
  return cached[unitId] ?? null;
}
