import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-full flex flex-col items-stretch justify-center px-6 py-16">
      <div className="mx-auto w-full max-w-md space-y-10">
        <header className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent">
            Vibe Coder
          </p>
          <h1 className="font-mono text-3xl font-bold leading-tight">
            Вход по паролю
          </h1>
          <p className="font-sans text-sm leading-relaxed text-neutral-400">
            Логины:{" "}
            <span className="font-mono text-foreground">vitya</span> или{" "}
            <span className="font-mono text-foreground">sega</span>. Пароли задаёт
            администратор в переменных окружения.
          </p>
        </header>
        <LoginForm />
      </div>
    </div>
  );
}
