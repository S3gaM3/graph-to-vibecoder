import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getAllUnitStates,
  getCompletionStats,
  getRankByPercent,
  getSubmissionInsights,
  getStudentsOverview,
} from "@/lib/progress";
import { ProductMap } from "@/components/ProductMap";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const states = await getAllUnitStates(user.id);
  const stats = await getCompletionStats(user.id);
  const rank = getRankByPercent(stats.percent);
  const insights = await getSubmissionInsights(user.id);
  const students = user.role === "mentor" ? await getStudentsOverview() : [];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="border border-neutral-800 p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-neutral-500">
            Прогресс
          </p>
          <p className="mt-2 font-mono text-2xl text-accent">{stats.percent}%</p>
          <p className="text-sm text-neutral-400">
            {stats.done} из {stats.total} миссий зачтено.
          </p>
        </article>
        <article className="border border-neutral-800 p-4 md:col-span-2">
          <p className="font-mono text-xs uppercase tracking-wider text-neutral-500">
            Звание
          </p>
          <p className="mt-2 font-mono text-xl text-accent">{rank.title}</p>
          <p className="text-sm text-neutral-300">{rank.praise}</p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="border border-neutral-800 p-4">
          <p className="mb-2 font-mono text-xs uppercase tracking-wider text-neutral-500">
            Последние попытки
          </p>
          <ul className="space-y-2 text-sm text-neutral-300">
            {insights.recent.length === 0 ? (
              <li>Пока нет попыток проверки.</li>
            ) : (
              insights.recent.map((item) => (
                <li key={item.id}>
                  {item.unitId} · {item.score}/100 · {item.passed ? "зачёт" : "доработка"}
                </li>
              ))
            )}
          </ul>
        </article>
        <article className="border border-neutral-800 p-4">
          <p className="mb-2 font-mono text-xs uppercase tracking-wider text-neutral-500">
            Типовые ошибки
          </p>
          <ul className="space-y-2 text-sm text-neutral-300">
            {insights.topIssues.length === 0 ? (
              <li>Типовых ошибок пока нет.</li>
            ) : (
              insights.topIssues.map((item) => (
                <li key={item.issue}>
                  ({item.count}) {item.issue}
                </li>
              ))
            )}
          </ul>
        </article>
      </section>

      {user.role === "mentor" ? (
        <section className="space-y-4 border border-neutral-800 p-4">
          <header className="space-y-1">
            <p className="font-mono text-xs uppercase tracking-wider text-accent">
              Панель наставника
            </p>
            <h2 className="font-mono text-lg">Прогресс студентов</h2>
          </header>
          <div className="grid gap-3 md:grid-cols-2">
            {students.map((s) => (
              <article key={s.id} className="border border-neutral-900 p-3">
                <p className="font-mono text-sm text-foreground">{s.displayName}</p>
                <p className="text-xs text-neutral-500">@{s.slug}</p>
                <p className="mt-2 font-mono text-xl text-accent">{s.percent}%</p>
                <p className="text-sm text-neutral-400">
                  {s.done} из {s.total} миссий зачтено
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <ProductMap states={states} />
    </div>
  );
}
