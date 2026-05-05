import Link from "next/link";
import type {
  KnowledgeRecommendation,
  KnowledgeSection,
} from "@/lib/knowledge-base";

export function UnitKnowledgeLinks({
  unitId,
  sections,
  personalized,
}: {
  unitId: string;
  sections: KnowledgeSection[];
  personalized?: KnowledgeRecommendation[];
}) {
  return (
    <section className="max-w-3xl space-y-4 border border-neutral-800 p-4">
      <h2 className="font-mono text-sm uppercase tracking-widest text-neutral-500">
        Почитать перед началом
      </h2>
      <p className="text-sm text-neutral-400">
        Рекомендованные статьи из базы знаний для миссии {unitId}.
      </p>
      {personalized && personalized.length > 0 ? (
        <div className="space-y-2 border border-neutral-900 p-3">
          <p className="font-mono text-xs uppercase tracking-wider text-accent">
            Персонально по твоим ошибкам
          </p>
          <ul className="space-y-2">
            {personalized.map((item) => (
              <li key={`${item.sectionId}-${item.title}`} className="text-sm text-neutral-300">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{item.title}</p>
                  {item.critical ? (
                    <span className="border border-amber-500 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-amber-400">
                      Критично сейчас
                    </span>
                  ) : null}
                </div>
                <p className="text-neutral-400">{item.summary}</p>
                <p className="text-xs text-amber-400">
                  {item.reason} Приоритет: {item.weight}
                </p>
                <Link
                  href={`/knowledge-base?q=${encodeURIComponent(item.query)}`}
                  className="mt-1 inline-block font-mono text-xs text-accent hover:underline"
                >
                  Открыть статью
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="space-y-4">
        {sections.map((section) => (
          <article key={section.id} className="space-y-2 border border-neutral-900 p-3">
            <h3 className="font-mono text-xs uppercase tracking-wider text-accent">
              {section.title}
            </h3>
            <ul className="space-y-2">
              {section.items.slice(0, 2).map((item) => (
                <li key={item.title} className="text-sm text-neutral-300">
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-neutral-400">{item.summary}</p>
                  <Link
                    href={`/knowledge-base?q=${encodeURIComponent(item.tags[0] ?? section.id)}`}
                    className="mt-1 inline-block font-mono text-xs text-accent hover:underline"
                  >
                    Открыть в базе знаний
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
