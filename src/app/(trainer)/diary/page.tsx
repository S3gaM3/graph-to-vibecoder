import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DiaryComposer } from "@/components/DiaryComposer";

export default async function DiaryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const entries = await prisma.diaryEntry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent">
          Дневник
        </p>
        <h1 className="font-mono text-3xl font-bold">Короткие записи</h1>
        <p className="font-sans text-sm text-neutral-400">
          Без кнопок «лайк». Только текст и дата.
        </p>
      </header>

      <DiaryComposer />

      <ul className="space-y-6 border-t border-neutral-800 pt-8">
        {entries.length === 0 ? (
          <li className="font-sans text-sm text-neutral-500">Пока пусто.</li>
        ) : (
          entries.map((e) => (
            <li key={e.id} className="space-y-1">
              <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-600">
                {e.createdAt.toLocaleString("ru-RU", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
                {e.unitId ? ` · миссия ${e.unitId}` : ""}
              </p>
              <p className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-neutral-200">
                {e.body}
              </p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
