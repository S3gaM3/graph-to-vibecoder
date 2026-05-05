import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

export function Nav() {
  return (
    <header className="border-b border-neutral-800">
      <div className="mx-auto flex max-w-6xl flex-wrap items-baseline justify-between gap-4 px-4 py-4 sm:px-8 lg:px-12">
        <Link
          href="/dashboard"
          className="font-mono text-sm font-bold uppercase tracking-[0.25em] text-accent"
        >
          Vibe Coder
        </Link>
        <nav className="flex flex-wrap items-center gap-6 font-sans text-sm text-neutral-300">
          <Link href="/dashboard" className="hover:text-foreground">
            Карта продукта
          </Link>
          <Link href="/profile" className="hover:text-foreground">
            Манифест
          </Link>
          <Link href="/diary" className="hover:text-foreground">
            Дневник
          </Link>
          <LogoutButton />
        </nav>
      </div>
    </header>
  );
}
