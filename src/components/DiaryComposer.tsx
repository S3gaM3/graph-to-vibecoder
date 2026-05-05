"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DiaryComposer() {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Не сохранилось");
        return;
      }
      setBody("");
      router.refresh();
    } catch {
      setError("Сеть недоступна");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 border border-neutral-800 p-4">
      <label className="block space-y-2">
        <span className="font-mono text-xs uppercase tracking-wider text-neutral-500">
          Одна мысль после миссии
        </span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          className="w-full resize-y border border-neutral-700 bg-black px-3 py-2 font-sans text-sm leading-relaxed text-foreground outline-none focus:border-accent"
          placeholder="Что было самым неожиданным?"
        />
      </label>
      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending || !body.trim()}
        className="bg-accent px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-black hover:opacity-90 disabled:opacity-40"
      >
        {pending ? "…" : "Записать"}
      </button>
    </form>
  );
}
