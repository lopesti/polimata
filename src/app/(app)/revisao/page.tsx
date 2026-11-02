import Link from "next/link";
import { db } from "@/lib/db/client";
import { perguntas } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ReviewSession } from "@/components/revisao/review-session";
import { CreateCardForm } from "@/components/revisao/create-card-form";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default function RevisaoPage({
  searchParams,
}: {
  searchParams?: { tipo?: string };
}) {
  const allRaw = db.select().from(perguntas).all();
  const tipoFilter = searchParams?.tipo;
  const all = tipoFilter
    ? allRaw.filter((p) => p.tipo === tipoFilter)
    : allRaw;
  const now = new Date();

  const due = all.filter(
    (p) =>
      p.estado === "novo" ||
      !p.proximaRevisao ||
      p.proximaRevisao <= now
  );

  const byEstado = {
    novo: all.filter((p) => p.estado === "novo").length,
    aprendendo: all.filter((p) => p.estado === "aprendendo").length,
    revisao: all.filter((p) => p.estado === "revisao").length,
    reaprendendo: all.filter((p) => p.estado === "reaprendendo").length,
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Revisão</h1>
          <p className="mt-1 text-sm text-slate-500">
            FSRS-5 · Hoje: <strong>{due.length}</strong> cards
          </p>
          <Link
            href="/revisao/dashboard"
            className="mt-2 inline-block text-xs text-blue-600 hover:underline"
          >
            Dashboard de revisão →
          </Link>
          <div className="mt-2 flex flex-wrap gap-1 text-xs">
            <Link href="/revisao" className="rounded-full border px-2 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800">todos</Link>
            <Link href="/revisao?tipo=basico" className="rounded-full border px-2 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800">básico</Link>
            <Link href="/revisao?tipo=cloze" className="rounded-full border px-2 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800">cloze</Link>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">novo {byEstado.novo}</Badge>
          <Badge variant="outline">aprendendo {byEstado.aprendendo}</Badge>
          <Badge>revisão {byEstado.revisao}</Badge>
          <Badge variant="warning">reaprendendo {byEstado.reaprendendo}</Badge>
        </div>
      </div>

      {due.length > 0 ? (
        <ReviewSession
          initialQueue={due.map((p) => ({
            id: p.id,
            tipo: p.tipo,
            frente: p.frente,
            verso: p.verso,
            estado: p.estado,
          }))}
        />
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center dark:border-slate-700">
          <p className="text-lg font-medium">Nada para revisar agora</p>
          <p className="mt-1 text-sm text-slate-500">
            Crie cards abaixo ou a partir de uma nota.
          </p>
        </div>
      )}

      <div className="mx-auto mt-12 max-w-2xl">
        <h2 className="mb-3 text-sm font-semibold uppercase text-slate-400">
          Novo card
        </h2>
        <CreateCardForm
          defaultFrente={
            all.length === 0
              ? "O {{c1::Sistema 1}} opera de forma automática e rápida."
              : ""
          }
        />
        <p className="mt-3 text-xs text-slate-400">
          Dica: cloze usa a sintaxe {"{{c1::resposta}}"}. Também dá para criar a
          partir de notas no futuro com 1 clique.
        </p>
      </div>

      {all.length > 0 && (
        <div className="mx-auto mt-10 max-w-2xl">
          <h2 className="mb-2 text-sm font-semibold uppercase text-slate-400">
            Todos os cards ({all.length})
          </h2>
          <ul className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
            {all.slice(0, 30).map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2">
                <span className="truncate pr-4">
                  {p.frente.slice(0, 80)}
                  {p.frente.length > 80 ? "…" : ""}
                </span>
                <Badge variant="outline">{p.estado}</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
