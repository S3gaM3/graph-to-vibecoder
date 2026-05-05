"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Manifest = {
  whoNow: string;
  whoBecome: string;
  obstacle: string;
};

export function ManifestForm({ initial }: { initial: Manifest }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setPending(true);
    try {
      const res = await fetch("/api/manifest", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Ошибка сохранения");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Сеть недоступна");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8 font-sans">
      <div className="grid gap-8 md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-wider text-neutral-500">
            Кто я сейчас
          </span>
          <textarea
            value={form.whoNow}
            onChange={(e) =>
              setForm((f) => ({ ...f, whoNow: e.target.value }))
            }
            rows={5}
            className="w-full resize-y border border-neutral-700 bg-black px-3 py-2 text-sm leading-relaxed text-foreground outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-wider text-neutral-500">
            Кем хочу стать
          </span>
          <textarea
            value={form.whoBecome}
            onChange={(e) =>
              setForm((f) => ({ ...f, whoBecome: e.target.value }))
            }
            rows={5}
            className="w-full resize-y border border-neutral-700 bg-black px-3 py-2 text-sm leading-relaxed text-foreground outline-none focus:border-accent"
          />
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-wider text-neutral-500">
            Что мешает
          </span>
          <textarea
            value={form.obstacle}
            onChange={(e) =>
              setForm((f) => ({ ...f, obstacle: e.target.value }))
            }
            rows={5}
            className="w-full resize-y border border-neutral-700 bg-black px-3 py-2 text-sm leading-relaxed text-foreground outline-none focus:border-accent"
          />
        </label>
      </div>
      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="font-mono text-xs text-accent">Сохранено.</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="bg-accent px-6 py-2 font-mono text-xs font-bold uppercase tracking-widest text-black hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "…" : "Сохранить манифест"}
      </button>
    </form>
  );
}
