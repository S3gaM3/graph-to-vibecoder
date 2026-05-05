import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ManifestForm } from "@/components/ManifestForm";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const row = await prisma.manifest.findUnique({
    where: { userId: user.id },
  });

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
      <ManifestForm initial={initial} />
    </div>
  );
}
