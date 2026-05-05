import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

type Rubric = {
  passScore: number;
  minLength: number;
  requiredKeywords: string[];
  recommendedKeywords: string[];
};

type RubricFile = {
  default: Rubric;
  units: Record<string, Partial<Rubric>>;
};

export type ReviewResult = {
  score: number;
  passed: boolean;
  feedback: string;
  issues: string[];
  improvements: string[];
};

let cache: RubricFile | null = null;

async function getRubrics(): Promise<RubricFile> {
  if (cache) return cache;
  const raw = await readFile(
    path.join(process.cwd(), "content", "review-rubrics.json"),
    "utf8",
  );
  cache = JSON.parse(raw) as RubricFile;
  return cache;
}

function hasWord(text: string, word: string): boolean {
  return text.toLowerCase().includes(word.toLowerCase());
}

export async function reviewSubmission(
  unitId: string,
  answer: string,
): Promise<ReviewResult> {
  const rubrics = await getRubrics();
  const unit = rubrics.units[unitId] ?? {};
  const merged: Rubric = {
    ...rubrics.default,
    ...unit,
    requiredKeywords: unit.requiredKeywords ?? rubrics.default.requiredKeywords,
    recommendedKeywords:
      unit.recommendedKeywords ?? rubrics.default.recommendedKeywords,
  };

  let score = 100;
  const issues: string[] = [];
  const improvements: string[] = [];
  const trimmed = answer.trim();

  if (trimmed.length < merged.minLength) {
    score -= 35;
    issues.push(
      `Ответ слишком короткий (${trimmed.length} символов), не раскрыт ход решения.`,
    );
    improvements.push(
      "Добавь последовательность действий: что сделал, чем проверил, какой итог получил.",
    );
  }

  const missingRequired = merged.requiredKeywords.filter(
    (k) => !hasWord(trimmed, k),
  );
  if (missingRequired.length > 0) {
    score -= Math.min(40, missingRequired.length * 10);
    issues.push(
      `Не хватает обязательных опорных слов: ${missingRequired.join(", ")}.`,
    );
    improvements.push(
      "Опиши решение языком задачи: термины из миссии должны явно встречаться в ответе.",
    );
  }

  const recommendedHit = merged.recommendedKeywords.filter((k) =>
    hasWord(trimmed, k),
  ).length;
  if (recommendedHit === 0) {
    score -= 10;
    issues.push("Ответ без контекста применения: непонятно, как использовать результат.");
    improvements.push(
      "Добавь блок 'где применю': компонент, данные, состояние или пользовательский сценарий.",
    );
  }

  if (!/[0-9]/.test(trimmed)) {
    score -= 5;
    issues.push("Нет измеримости: отсутствуют числа/параметры (px, количество шагов, поля и т.д.).");
    improvements.push(
      "Добавь конкретику: 2-3 метрики или параметры, по которым проверяется готовность.",
    );
  }

  score = Math.max(0, Math.min(100, score));
  const passed = score >= merged.passScore;
  const feedback = passed
    ? "Хорошо: решение структурировано, критерии задания покрыты."
    : "Пока не зачтено: доработай по ошибкам ниже и отправь заново.";

  if (issues.length === 0) {
    improvements.push(
      "Для усиления: добавь короткий блок рефлексии — что сделал бы иначе во второй итерации.",
    );
  }

  return { score, passed, feedback, issues, improvements };
}
