import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUnitMeta } from "@/lib/curriculum";
import { loadUnitMarkdown } from "@/lib/markdown";
import { getUnitState } from "@/lib/progress";
import { getTutorHint } from "@/lib/tutor";
import { MissionContent } from "@/components/MissionContent";
import { TerminalTutor } from "@/components/TerminalTutor";
import { CompleteMissionButton } from "@/components/CompleteMissionButton";

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

        <section className="max-w-3xl space-y-4">
          <h2 className="font-mono text-sm uppercase tracking-widest text-neutral-500">
            Прогресс
          </h2>
          <CompleteMissionButton
            unitId={unitId}
            canComplete={state === "available"}
            alreadyDone={state === "done"}
          />
        </section>
      </div>
      <TerminalTutor line={hint} />
    </>
  );
}
