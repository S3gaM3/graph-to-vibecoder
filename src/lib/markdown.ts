import "server-only";

import { readFile } from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";

export async function loadUnitMarkdown(unitId: string): Promise<string | null> {
  const safeId = unitId.replace(/[^0-9.]/g, "");
  if (safeId !== unitId) return null;
  const filePath = path.join(process.cwd(), "content", "units", `${safeId}.md`);
  if (!fs.existsSync(filePath)) return null;
  return readFile(filePath, "utf8");
}
