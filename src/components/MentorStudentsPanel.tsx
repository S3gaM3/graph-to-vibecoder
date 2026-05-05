"use client";

import { useEffect, useState } from "react";

type StudentOverview = {
  id: string;
  slug: string;
  displayName: string;
  done: number;
  total: number;
  percent: number;
  currentUnitId: string | null;
  online: boolean;
  lastSeenAt: string | Date | null;
};

type Props = {
  initialStudents: StudentOverview[];
};

export function MentorStudentsPanel({ initialStudents }: Props) {
  const [students, setStudents] = useState<StudentOverview[]>(initialStudents);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/mentor/students", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { students: StudentOverview[] };
        if (!cancelled) {
          setStudents(data.students);
        }
      } catch {
        // keep last known state on temporary network errors
      }
    };

    const id = setInterval(() => {
      void load();
    }, 8000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
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
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-sm text-foreground">{s.displayName}</p>
              <span
                className={`text-[10px] uppercase tracking-wider ${
                  s.online ? "text-accent" : "text-neutral-500"
                }`}
              >
                {s.online ? "в сети" : "не в сети"}
              </span>
            </div>
            <p className="text-xs text-neutral-500">@{s.slug}</p>
            <p className="mt-2 font-mono text-xl text-accent">{s.percent}%</p>
            <p className="text-sm text-neutral-400">
              {s.done} из {s.total} миссий зачтено
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Сейчас: {s.currentUnitId ? `миссия ${s.currentUnitId}` : "вне миссии"}
            </p>
            <p className="text-xs text-neutral-600">
              Последняя активность:{" "}
              {s.lastSeenAt
                ? new Date(s.lastSeenAt).toLocaleString("ru-RU", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })
                : "нет данных"}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
