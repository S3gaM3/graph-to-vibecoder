import Link from "next/link";
import { getCurriculum } from "@/lib/curriculum";
import type { UnitState } from "@/lib/progress";

type Props = {
  states: Record<string, UnitState>;
};

function segmentClass(state: UnitState) {
  if (state === "done") return "border-accent text-accent";
  if (state === "available") return "border-neutral-500 text-foreground hover:border-accent";
  return "border-neutral-800 text-neutral-600";
}

export async function ProductMap({ states }: Props) {
  const cur = await getCurriculum();

  return (
    <section className="space-y-12">
      <header className="max-w-2xl space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent">
          Карта продукта
        </p>
        <h1 className="font-mono text-4xl font-bold leading-none sm:text-5xl">
          От скетча упаковки до запущенного сервиса
        </h1>
        <p className="font-sans text-sm leading-relaxed text-neutral-400">
          Горизонтальная лента этапов — как слои в Photoshop: пройденное подсвечено
          кислотным, доступное можно открыть, остальное ждёт очереди.
        </p>
      </header>

      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-max gap-6">
          {cur.modules.map((mod) => (
            <div
              key={mod.id}
              className="flex w-72 shrink-0 flex-col border border-neutral-800 bg-neutral-950/50"
            >
              <div className="border-b border-neutral-800 px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                  {mod.id}
                </p>
                <h2 className="font-sans text-sm font-semibold leading-snug">
                  {mod.title}
                </h2>
              </div>
              <ul className="flex flex-col gap-0 divide-y divide-neutral-900">
                {mod.units.map((u) => {
                  const state = states[u.id] ?? "locked";
                  const common =
                    "block border-l-4 px-4 py-3 text-left text-sm transition-colors " +
                    segmentClass(state);
                  if (state === "locked") {
                    return (
                      <li key={u.id}>
                        <span className={common + " cursor-not-allowed"}>
                          <span className="font-mono text-xs text-neutral-600">
                            {u.id}
                          </span>
                          <span className="mt-1 block font-sans">{u.title}</span>
                        </span>
                      </li>
                    );
                  }
                  return (
                    <li key={u.id}>
                      <Link href={`/unit/${encodeURIComponent(u.id)}`} className={common}>
                        <span className="font-mono text-xs">{u.id}</span>
                        <span className="mt-1 block font-sans">{u.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
