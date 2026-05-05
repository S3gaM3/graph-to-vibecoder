"use client";

import { useState } from "react";

type CheckResult = {
  score: number;
  issues: string[];
  hints: string[];
};

export function CodePlayground({ unitId }: { unitId: string }) {
  const [html, setHtml] = useState("<div class='card'>Привет, Vibe Coder</div>");
  const [css, setCss] = useState(".card { padding: 16px; border: 1px solid #444; }");
  const [js, setJs] = useState("console.log('ready');");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const srcDoc = `<!doctype html><html><head><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`;

  async function onCheck() {
    setError(null);
    const res = await fetch("/api/code-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unitId, html, css, js }),
    });
    const data = (await res.json()) as CheckResult & { error?: string };
    if (!res.ok) {
      setError(data.error ?? "Ошибка проверки кода");
      return;
    }
    setResult(data);
  }

  return (
    <section className="max-w-6xl space-y-4 border border-neutral-800 p-4">
      <h2 className="font-mono text-sm uppercase tracking-widest text-neutral-500">
        Среда проверки кода
      </h2>
      <p className="text-sm text-neutral-400">
        Пиши HTML/CSS/JS, жми «Проверить код», получай ошибки и подсказки.
      </p>
      <div className="grid gap-4 lg:grid-cols-3">
        <textarea
          rows={9}
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          className="w-full resize-y border border-neutral-700 bg-black px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-accent"
        />
        <textarea
          rows={9}
          value={css}
          onChange={(e) => setCss(e.target.value)}
          className="w-full resize-y border border-neutral-700 bg-black px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-accent"
        />
        <textarea
          rows={9}
          value={js}
          onChange={(e) => setJs(e.target.value)}
          className="w-full resize-y border border-neutral-700 bg-black px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-accent"
        />
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCheck}
          className="bg-accent px-6 py-2 font-mono text-xs font-bold uppercase tracking-widest text-black hover:opacity-90"
        >
          Проверить код
        </button>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {result ? (
        <div className="space-y-2 border border-neutral-800 p-3">
          <p className="font-mono text-xs text-neutral-300">Оценка: {result.score}/100</p>
          <ul className="list-disc pl-5 text-sm text-neutral-300">
            {result.issues.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
          <ul className="list-disc pl-5 text-sm text-neutral-400">
            {result.hints.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <iframe
        title="preview"
        sandbox="allow-scripts"
        srcDoc={srcDoc}
        className="h-56 w-full border border-neutral-800 bg-white"
      />
    </section>
  );
}
