"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Ошибка входа");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Сеть недоступна");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 font-sans">
      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-wider text-neutral-500">
          Логин
        </span>
        <input
          name="slug"
          autoComplete="username"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full border border-neutral-700 bg-black px-4 py-3 font-mono text-sm text-foreground outline-none focus:border-accent"
          placeholder="vitya или sega"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-wider text-neutral-500">
          Пароль
        </span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-neutral-700 bg-black px-4 py-3 font-mono text-sm text-foreground outline-none focus:border-accent"
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
        className="w-full bg-accent py-3 font-mono text-sm font-bold uppercase tracking-widest text-black hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "…" : "Войти"}
      </button>
    </form>
  );
}
