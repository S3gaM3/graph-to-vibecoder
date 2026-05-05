import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ManifestForm } from "@/components/ManifestForm";
import {
  getCompletionStats,
  getRankByPercent,
  getSubmissionInsights,
} from "@/lib/progress";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const row = await prisma.manifest.findUnique({
    where: { userId: user.id },
  });
  const stats = await getCompletionStats(user.id);
  const rank = getRankByPercent(stats.percent);
  const insights = await getSubmissionInsights(user.id);

  const initial = {
    whoNow: row?.whoNow ?? "",
    whoBecome: row?.whoBecome ?? "",
    obstacle: row?.obstacle ?? "",
  };

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent">
          Манифест вайбкодера
        </p>
        <h1 className="font-mono text-3xl font-bold">
          {user.displayName}, твоё видение
        </h1>
        <p className="max-w-2xl font-sans text-sm leading-relaxed text-neutral-400">
          Три блока из стартового квеста остаются здесь. Возвращайся перед долгими
          сессиями — это якорь, не декорация.
        </p>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        <article className="border border-neutral-800 p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-neutral-500">
            Текущее звание
          </p>
          <p className="mt-2 font-mono text-lg text-accent">{rank.title}</p>
          <p className="text-sm text-neutral-300">{rank.praise}</p>
        </article>
        <article className="border border-neutral-800 p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-neutral-500">
            Выполнение
          </p>
          <p className="mt-2 font-mono text-2xl text-accent">{stats.percent}%</p>
          <p className="text-sm text-neutral-400">
            {stats.done} из {stats.total} миссий зачтено.
          </p>
        </article>
        <article className="border border-neutral-800 p-4">
          <p className="mb-2 font-mono text-xs uppercase tracking-wider text-neutral-500">
            Частые ошибки
          </p>
          <ul className="space-y-1 text-sm text-neutral-300">
            {insights.topIssues.length === 0 ? (
              <li>Пока нет повторяющихся ошибок.</li>
            ) : (
              insights.topIssues.slice(0, 3).map((item) => (
                <li key={item.issue}>({item.count}) {item.issue}</li>
              ))
            )}
          </ul>
        </article>
      </section>
      <ManifestForm initial={initial} />
    </div>
  );
}
