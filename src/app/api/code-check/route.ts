import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/api-user";

const schema = z.object({
  unitId: z.string().min(1),
  html: z.string(),
  css: z.string(),
  js: z.string(),
});

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { html, css, js } = parsed.data;
  let score = 100;
  const issues: string[] = [];
  const hints: string[] = [];

  if (!html.includes("<")) {
    score -= 30;
    issues.push("HTML почти пустой: добавь структуру разметки.");
  }
  if (!css.includes("{") || !css.includes("}")) {
    score -= 20;
    issues.push("CSS не содержит правил стилей.");
  }
  if (js.trim().length < 8) {
    score -= 10;
    issues.push("JS слишком короткий: добавь базовую интерактивность.");
  }
  if (!/class=|className=/.test(html)) {
    score -= 10;
    issues.push("Нет классов в разметке: трудно масштабировать стили.");
    hints.push("Добавь семантические классы для основных блоков.");
  }
  if (!/button|input|form/.test(html)) {
    hints.push("Добавь интерактивный элемент (button/input/form), чтобы проверить сценарий.");
  }
  if (!/addEventListener|onclick|onchange/.test(js)) {
    hints.push("Подключи обработчик события, чтобы показать реакцию интерфейса.");
  }
  if (!/rem|px|%/.test(css)) {
    hints.push("Укажи измеримые отступы/размеры, чтобы вёрстка была предсказуемой.");
  }

  score = Math.max(0, score);
  if (issues.length === 0) {
    issues.push("Критичных проблем не найдено.");
  }
  return NextResponse.json({ score, issues, hints });
}
