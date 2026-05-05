import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

export type KnowledgeItem = {
  title: string;
  summary: string;
  tags: string[];
  body: string;
};

export type KnowledgeSection = {
  id: string;
  title: string;
  items: KnowledgeItem[];
};

type KnowledgeFile = {
  sections: KnowledgeSection[];
};

let cache: KnowledgeFile | null = null;

export async function getKnowledgeBase(): Promise<KnowledgeSection[]> {
  if (cache) return cache.sections;
  const raw = await readFile(
    path.join(process.cwd(), "content", "knowledge-base.json"),
    "utf8",
  );
  cache = JSON.parse(raw) as KnowledgeFile;
  return cache.sections;
}
