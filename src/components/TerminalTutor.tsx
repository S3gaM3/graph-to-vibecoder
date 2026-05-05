"use client";

export function TerminalTutor({ line }: { line: string | null }) {
  if (!line) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-800 bg-black/95 px-4 py-3 backdrop-blur sm:px-8">
      <div className="mx-auto flex max-w-6xl items-start gap-3 font-mono text-xs text-neutral-200">
        <span className="shrink-0 text-accent">$</span>
        <p className="min-w-0 leading-relaxed">{line}</p>
      </div>
    </div>
  );
}
