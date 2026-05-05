"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  unitId: string;
  canComplete: boolean;
  alreadyDone: boolean;
};

export function CompleteMissionButton({
  unitId,
  canComplete,
  alreadyDone,
}: Props) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canComplete || alreadyDone) return;
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitId, notes: notes || undefined }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Не удалось сохранить");
        return;
      }
      router.refresh();
    } catch {
      setError("Сеть недоступна");
    } finally {
      setPending(false);
    }
  }

  if (alreadyDone) {
    return (
      <p className="font-mono text-sm text-accent">
        Миссия отмечена выполненной. Следующий юнит откроется на карте.
      </p>
    );
  }

  if (!canComplete) {
    return (
      <p className="font-sans text-sm text-neutral-500">
        Сначала завершите предыдущий юнит на карте.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 border border-neutral-800 p-4">
      <label className="block space-y-2">
        <span className="font-mono text-xs uppercase tracking-wider text-neutral-500">
          Заметка (необязательно)
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full resize-y border border-neutral-700 bg-black px-3 py-2 font-sans text-sm text-foreground outline-none focus:border-accent"
          placeholder="Одна мысль: что было неожиданным?"
        />
      </label>
      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="bg-accent px-6 py-2 font-mono text-xs font-bold uppercase tracking-widest text-black hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "…" : "Отметить пройденным"}
      </button>
    </form>
  );
}
