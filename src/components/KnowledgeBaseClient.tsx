"use client";

import { useMemo, useState } from "react";
import type { KnowledgeSection } from "@/lib/knowledge-base";

export function KnowledgeBaseClient({
  sections,
  initialQuery = "",
}: {
  sections: KnowledgeSection[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return sections;
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          const hay = `${item.title} ${item.summary} ${item.body} ${item.tags.join(" ")}`.toLowerCase();
          return hay.includes(q);
        }),
      }))
      .filter((section) => section.items.length > 0);
  }, [sections, q]);

  return (
    <div className="space-y-6">
      <div className="max-w-xl">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по базе знаний: prompt, форма, тесты, mysql..."
          className="w-full border border-neutral-700 bg-black px-4 py-3 font-sans text-sm text-foreground outline-none focus:border-accent"
        />
      </div>
      <div className="space-y-8">
        {filtered.length === 0 ? (
          <p className="text-sm text-neutral-500">Ничего не найдено. Уточни запрос.</p>
        ) : (
          filtered.map((section) => (
            <section key={section.id} className="space-y-3">
              <h2 className="font-mono text-lg text-accent">{section.title}</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {section.items.map((item) => (
                  <article key={item.title} className="border border-neutral-800 p-4 space-y-2">
                    <h3 className="font-mono text-sm">{item.title}</h3>
                    <p className="text-sm text-neutral-300">{item.summary}</p>
                    <p className="text-sm text-neutral-400">{item.body}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="border border-neutral-700 px-2 py-0.5 text-[10px] uppercase tracking-wider text-neutral-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
