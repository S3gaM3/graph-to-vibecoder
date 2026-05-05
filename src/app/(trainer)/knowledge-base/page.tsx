import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getKnowledgeBase } from "@/lib/knowledge-base";
import { KnowledgeBaseClient } from "@/components/KnowledgeBaseClient";

export default async function KnowledgeBasePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sections = await getKnowledgeBase();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent">
          База знаний
        </p>
        <h1 className="font-mono text-3xl font-bold">Короткие ответы на частые вопросы</h1>
        <p className="max-w-3xl text-sm text-neutral-400">
          Здесь собраны логичные и практичные шпаргалки по промптам, компонентам,
          данным, проверкам и качеству. Используй поиск перед каждой миссией.
        </p>
      </header>
      <KnowledgeBaseClient sections={sections} />
    </div>
  );
}
