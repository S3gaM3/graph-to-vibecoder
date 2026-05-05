"use client";

import { useState } from "react";

type ReviewResult = {
  score: number;
  passed: boolean;
  feedback: string;
  issues: string[];
  improvements: string[];
};

export function UnitReviewPanel({ unitId }: { unitId: string }) {
  const [answer, setAnswer] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReviewResult | null>(null);

  async function onCheck(e: React.FormEvent) {
    e.preventDefault();
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

  return (
    <section className="max-w-3xl space-y-4 border border-neutral-800 p-4">
      <h2 className="font-mono text-sm uppercase tracking-widest text-neutral-500">
        Проверка задания и разбор ошибок
      </h2>
      <form onSubmit={onCheck} className="space-y-4">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={7}
          className="w-full resize-y border border-neutral-700 bg-black px-3 py-2 font-sans text-sm text-foreground outline-none focus:border-accent"
          placeholder="Опиши, как ты выполнил миссию: шаги, что проверил, какой итог получил."
        />
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={pending || answer.trim().length === 0}
          className="bg-accent px-6 py-2 font-mono text-xs font-bold uppercase tracking-widest text-black hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Проверяем…" : "Проверить"}
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
