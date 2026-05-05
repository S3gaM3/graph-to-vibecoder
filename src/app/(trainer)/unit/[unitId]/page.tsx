import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUnitMeta } from "@/lib/curriculum";
import { loadUnitMarkdown } from "@/lib/markdown";
import { getUnitState } from "@/lib/progress";
import { getTutorHint } from "@/lib/tutor";
import { getReviewCombo } from "@/lib/review-combos";
import { getUnitGuide } from "@/lib/unit-guides";
import { MissionContent } from "@/components/MissionContent";
import { TerminalTutor } from "@/components/TerminalTutor";
import { UnitReviewPanel } from "@/components/UnitReviewPanel";
import { CodePlayground } from "@/components/CodePlayground";
import { UnitGuidePanel } from "@/components/UnitGuidePanel";

type PageProps = {
  params: Promise<{ unitId: string }>;
};

export default async function UnitPage(props: PageProps) {
  const { unitId: rawId } = await props.params;
  const unitId = decodeURIComponent(rawId);

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const meta = await getUnitMeta(unitId);
  if (!meta) notFound();

  const md = await loadUnitMarkdown(unitId);
  if (!md) notFound();

  const state = await getUnitState(user.id, unitId);
  if (state === "locked") redirect("/dashboard");

  const hint = await getTutorHint(unitId);
  const combo = await getReviewCombo(unitId);
  const guide = await getUnitGuide(unitId);

  return (
    <>
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="space-y-2">
          <p className="font-sans text-sm text-neutral-400">{meta.moduleTitle}</p>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            Миссия {unitId}
          </p>
          <h1 className="font-mono text-3xl font-bold leading-tight sm:text-4xl">
            {meta.title}
          </h1>
        </header>

        <MissionContent source={md} />
        <UnitGuidePanel guide={guide} />

        <CodePlayground unitId={unitId} />

        <UnitReviewPanel unitId={unitId} combo={combo} />

        <section className="max-w-3xl space-y-4">
          <h2 className="font-mono text-sm uppercase tracking-widest text-neutral-500">
            Прогресс
          </h2>
          <p className="text-sm text-neutral-400">
            Отметка «пройдено» ставится автоматически после успешной проверки задания.
          </p>
          {state === "done" ? (
            <p className="font-mono text-sm text-accent">Миссия зачтена автоматически.</p>
          ) : (
            <p className="font-sans text-sm text-neutral-500">
              Для зачёта отправь решение в блоке проверки выше и набери проходной балл.
            </p>
          )}
        </section>
      </div>
      <TerminalTutor line={hint} />
    </>
  );
}
