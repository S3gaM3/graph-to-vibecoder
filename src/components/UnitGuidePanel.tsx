type Guide = {
  questions: string[];
  doneCriteria: string[];
};

export function UnitGuidePanel({ guide }: { guide: Guide }) {
  return (
    <section className="max-w-3xl space-y-4 border border-neutral-800 p-4">
      <h2 className="font-mono text-sm uppercase tracking-widest text-neutral-500">
        Понятные вопросы и критерии
      </h2>
      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-wider text-neutral-500">
          Вопросы перед началом
        </p>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-neutral-300">
          {guide.questions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>
      </div>
      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-wider text-neutral-500">
          Задание считается выполненным, если
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-300">
          {guide.doneCriteria.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
