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

export type KnowledgeRecommendation = {
  sectionId: string;
  sectionTitle: string;
  title: string;
  summary: string;
  query: string;
  reason: string;
  weight: number;
  critical: boolean;
};

type KnowledgeFile = {
  sections: KnowledgeSection[];
};

let cache: KnowledgeFile | null = null;
let linkCache: { default: string[]; units: Record<string, string[]> } | null = null;

export async function getKnowledgeBase(): Promise<KnowledgeSection[]> {
  if (cache) return cache.sections;
  const raw = await readFile(
    path.join(process.cwd(), "content", "knowledge-base.json"),
    "utf8",
  );
  cache = JSON.parse(raw) as KnowledgeFile;
  return cache.sections;
}

export async function getUnitKnowledgeLinks(unitId: string): Promise<KnowledgeSection[]> {
  const sections = await getKnowledgeBase();
  if (!linkCache) {
    const raw = await readFile(
      path.join(process.cwd(), "content", "unit-kb-links.json"),
      "utf8",
    );
    linkCache = JSON.parse(raw) as {
      default: string[];
      units: Record<string, string[]>;
    };
  }

  const ids = linkCache.units[unitId] ?? linkCache.default;
  const set = new Set(ids);
  return sections.filter((section) => set.has(section.id));
}

export async function getPersonalizedKnowledgeRecommendations(
  unitId: string,
  topIssues: Array<{ issue: string; count: number }>,
): Promise<KnowledgeRecommendation[]> {
  const sections = await getUnitKnowledgeLinks(unitId);
  const issueText = topIssues.map((i) => i.issue.toLowerCase()).join(" ");
  const maxCount = Math.max(1, ...topIssues.map((i) => i.count));

  const recs: KnowledgeRecommendation[] = [];
  for (const section of sections) {
    for (const item of section.items.slice(0, 3)) {
      const itemText = `${item.title} ${item.summary} ${item.tags.join(" ")}`.toLowerCase();
      let matchedCount = 0;
      const intersects = topIssues.some((i) => {
        const tokens = i.issue.toLowerCase().split(/[^a-zа-я0-9]+/i).filter(Boolean);
        const hit = tokens.some((t) => t.length > 3 && itemText.includes(t));
        if (hit) {
          matchedCount = Math.max(matchedCount, i.count);
        }
        return hit;
      });
      if (intersects || issueText.includes("провер")) {
        const sectionBoost =
          section.id === "quality" || section.id === "data" ? 8 : 3;
        const weight =
          (intersects ? matchedCount * 10 : 5) +
          Math.round((matchedCount / maxCount) * 20) +
          sectionBoost;
        recs.push({
          sectionId: section.id,
          sectionTitle: section.title,
          title: item.title,
          summary: item.summary,
          query: item.tags[0] ?? section.id,
          reason: intersects
            ? "Совпадает с типовой ошибкой ученика."
            : "Подходит для усиления качества проверки.",
          weight,
          critical: false,
        });
      }
    }
  }

  if (recs.length === 0) {
    return sections.flatMap((section) =>
      section.items.slice(0, 1).map((item) => ({
        sectionId: section.id,
        sectionTitle: section.title,
        title: item.title,
        summary: item.summary,
        query: item.tags[0] ?? section.id,
        reason: "Базовая рекомендация для текущей миссии.",
        weight: 1,
        critical: false,
      })),
    );
  }

  const sorted = recs.sort((a, b) => b.weight - a.weight);
  if (sorted[0]) {
    sorted[0].critical = true;
  }
  return sorted.slice(0, 4);
}
