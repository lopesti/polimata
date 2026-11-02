import { previewPasses } from "@/lib/rsvp/engine";

export function Preview3Pass({ text }: { text: string }) {
  const p = previewPasses(text);

  return (
    <div className="space-y-4 rounded-lg border border-dashed border-slate-300 p-4 text-sm dark:border-slate-700">
      <div>
        <p className="text-xs font-medium uppercase text-slate-400">1ª passada — estrutura</p>
        <p className="mt-1 font-medium">{p.titleLike}</p>
        {p.headings.length > 0 && (
          <ul className="mt-2 list-inside list-disc text-slate-600 dark:text-slate-400">
            {p.headings.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <p className="text-xs font-medium uppercase text-slate-400">
          2ª passada — início
        </p>
        <p className="mt-1 text-slate-700 dark:text-slate-300">{p.firstSentences}</p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase text-slate-400">
          3ª passada — final
        </p>
        <p className="mt-1 text-slate-700 dark:text-slate-300">{p.lastSentences}</p>
      </div>
    </div>
  );
}
