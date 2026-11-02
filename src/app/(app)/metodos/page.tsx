import { db } from "@/lib/db/client";
import { metodos } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const categoriaCor: Record<string, "default" | "secondary" | "outline" | "success" | "warning"> = {
  leitura: "default",
  compreensao: "secondary",
  memoria: "success",
  aplicacao: "warning",
  social: "outline",
  audio: "secondary",
  metacognicao: "outline",
};

export default function MetodosPage() {
  const rows = db.select().from(metodos).orderBy(asc(metodos.categoria), asc(metodos.nome)).all();

  const byCat = rows.reduce<Record<string, typeof rows>>((acc, m) => {
    const c = m.categoria;
    if (!acc[c]) acc[c] = [];
    acc[c].push(m);
    return acc;
  }, {});

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold tracking-tight">Biblioteca de Métodos</h1>
      <p className="mt-1 text-sm text-slate-500">
        {rows.length} métodos · Método é ferramenta, não dogma
      </p>

      <div className="mt-8 space-y-10">
        {Object.entries(byCat).map(([cat, items]) => (
          <section key={cat}>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              <Badge variant={categoriaCor[cat] ?? "secondary"}>{cat}</Badge>
              <span className="text-slate-400">{items.length}</span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((m) => (
                <div
                  key={m.id}
                  className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
                >
                  <h3 className="font-medium">{m.nome}</h3>
                  {m.paraQue && (
                    <p className="mt-1 text-sm text-slate-500 line-clamp-2">{m.paraQue}</p>
                  )}
                  <div className="mt-3 flex gap-3 text-xs text-slate-400">
                    {m.tempoTipico != null && <span>{m.tempoTipico} min</span>}
                    {m.esforco != null && <span>esforço {m.esforco}/5</span>}
                    {m.eficaciaPessoal != null && (
                      <span>eficácia {Number(m.eficaciaPessoal).toFixed(1)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
