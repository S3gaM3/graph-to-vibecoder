"use client";

import { useState } from "react";

type ReviewResult = {
  score: number;
  passed: boolean;
  feedback: string;
  issues: string[];
  improvements: string[];
};

type ComboConfig = {
  sequence: string[];
  distractors: string[];
};

export function UnitReviewPanel({
  unitId,
  combo,
}: {
  unitId: string;
  combo: ComboConfig;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const [wrongClicks, setWrongClicks] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const answer = picked.join(". ") + (picked.length ? "." : "");
  const expected = combo.sequence[picked.length];
  const complete = picked.length === combo.sequence.length;
  const options = [...combo.sequence, ...combo.distractors];

  async function onCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!complete) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitId, answer }),
      });
      const data = (await res.json()) as ReviewResult & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Ошибка проверки");
        return;
      }
      setResult(data);
    } catch {
      setError("Сеть недоступна");
    } finally {
      setPending(false);
    }
  }

  function onTokenClick(token: string) {
    if (complete) return;
    if (token === expected) {
      setPicked((prev) => [...prev, token]);
      setHint(null);
      return;
    }
    setWrongClicks((n) => n + 1);
    setHint("Неверная кнопка для этого шага. Иди по логике миссии по порядку.");
  }

  function resetCombo() {
    setPicked([]);
    setWrongClicks(0);
    setHint(null);
    setResult(null);
    setError(null);
  }

  return (
    <section className="max-w-3xl space-y-4 border border-neutral-800 p-4">
      <h2 className="font-mono text-sm uppercase tracking-widest text-neutral-500">
        Проверка задания и разбор ошибок
      </h2>
      <form onSubmit={onCheck} className="space-y-4">
        <div className="space-y-3 border border-neutral-800 p-3">
          <p className="text-sm text-neutral-300">
            Собери ответ правильной комбинацией кнопок. Ошибки: {wrongClicks}
          </p>
          <div className="flex flex-wrap gap-2">
            {options.map((token) => (
              <button
                key={token}
                type="button"
                onClick={() => onTokenClick(token)}
                disabled={complete}
                className="border border-neutral-700 px-3 py-1 text-left text-xs text-neutral-200 hover:border-accent disabled:opacity-50"
              >
                {token}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {combo.sequence.map((_, idx) => (
              <div
                key={idx}
                className="border border-neutral-800 bg-black px-2 py-1 text-xs text-neutral-300"
              >
                {picked[idx] ?? `Шаг ${idx + 1}: ожидает правильную кнопку`}
              </div>
            ))}
          </div>
          {hint ? <p className="text-sm text-amber-400">{hint}</p> : null}
          <button
            type="button"
            onClick={resetCombo}
            className="font-mono text-xs text-neutral-400 hover:text-accent"
          >
            Сбросить комбинацию
          </button>
        </div>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={pending || !complete}
          className="bg-accent px-6 py-2 font-mono text-xs font-bold uppercase tracking-widest text-black hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Проверяем…" : "Проверить комбинацию"}
        </button>
      </form>

      {result ? (
        <div className="space-y-3 border-t border-neutral-800 pt-4">
          <p className="font-mono text-sm">
            Результат:{" "}
            <span className={result.passed ? "text-accent" : "text-amber-400"}>
              {result.score}/100
            </span>
          </p>
          <p className="text-sm text-neutral-300">{result.feedback}</p>
          <div>
            <p className="mb-1 font-mono text-xs uppercase tracking-wider text-neutral-500">
              Ошибки
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-300">
              {result.issues.length === 0 ? (
                <li>Критичных ошибок не найдено.</li>
              ) : (
                result.issues.map((it) => <li key={it}>{it}</li>)
              )}
            </ul>
          </div>
          <div>
            <p className="mb-1 font-mono text-xs uppercase tracking-wider text-neutral-500">
              Как исправить
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-300">
              {result.improvements.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  );
}
