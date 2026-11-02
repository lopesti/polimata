import { db } from "@/lib/db/client";
import { metodos, sessoes, stacks, perguntas, notas, fontes } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const topMetodos = db
    .select()
    .from(metodos)
    .orderBy(desc(metodos.eficaciaPessoal))
    .limit(5)
    .all();

  const recentSessoes = db
    .select()
    .from(sessoes)
    .orderBy(desc(sessoes.data))
    .limit(10)
    .all();

  const allStacks = db.select().from(stacks).all();
  const allPerguntas = db.select().from(perguntas).all();
  const nNotas = db.select().from(notas).all().length;
  const nFontes = db.select().from(fontes).all().length;

  const now = new Date();
  const now0 = new Date();
  now0.setHours(0,0,0,0);
  const forecast7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now0);
    d.setDate(d.getDate() + i);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const count = allPerguntas.filter((p) => {
      if (i === 0 && (p.estado === "novo" || !p.proximaRevisao)) return true;
      if (!p.proximaRevisao) return false;
      const due = new Date(p.proximaRevisao);
      return due >= d && due < next;
    }).length;
    return { label: d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" }), count };
  });

  const due = allPerguntas.filter(
    (p) => p.estado === "novo" || !p.proximaRevisao || p.proximaRevisao <= now
  ).length;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Tracking de eficácia e carga</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Fontes", value: nFontes },
          { label: "Notas", value: nNotas },
          { label: "Cards due", value: due },
          { label: "Stacks", value: allStacks.length },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
          >
            <p className="text-xs uppercase text-slate-400">{c.label}</p>
            <p className="mt-1 text-3xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase text-slate-400">
          Carga FSRS (7 dias)
        </h2>
        <div className="mt-3 flex items-end gap-2 h-24">
          {forecast7.map((d) => (
            <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] text-slate-500">{d.count}</span>
              <div
                className="w-full rounded-t bg-slate-900 dark:bg-slate-100"
                style={{ height: `${Math.max(4, d.count * 12)}px` }}
              />
              <span className="text-[10px] text-slate-400">{d.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-sm font-semibold uppercase text-slate-400">
            Top 5 métodos (eficácia pessoal)
          </h2>
          <ul className="mt-3 space-y-2">
            {topMetodos.map((m, i) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 dark:border-slate-800"
              >
                <span className="text-sm">
                  <span className="mr-2 text-slate-400">{i + 1}.</span>
                  {m.nome}
                </span>
                <Badge variant="success">
                  {Number(m.eficaciaPessoal ?? 3).toFixed(1)}
                </Badge>
              </li>
            ))}
            {topMetodos.length === 0 && (
              <p className="text-sm text-slate-400">Rode o seed para popular métodos.</p>
            )}
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase text-slate-400">
            Sessões recentes
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {recentSessoes.length === 0 && (
              <p className="text-slate-400">
                Nenhuma sessão ainda. Revisões FSRS e registros manuais aparecem aqui.
              </p>
            )}
            {recentSessoes.map((s) => (
              <li
                key={s.id}
                className="flex justify-between rounded-md border border-slate-100 px-3 py-2 dark:border-slate-800"
              >
                <span>
                  {s.duracao ? `${s.duracao} min` : "—"} · acertos {s.acertos ?? 0} / erros{" "}
                  {s.erros ?? 0}
                </span>
                <span className="text-xs text-slate-400">
                  {s.data ? new Date(s.data).toLocaleDateString("pt-BR") : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
