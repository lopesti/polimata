import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db/client";
import { fontes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { DeleteFonteButton } from "@/components/fontes/delete-button";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

export default function FonteDetalhePage({ params }: Props) {
  const [fonte] = db
    .select()
    .from(fontes)
    .where(eq(fontes.id, params.id))
    .all();

  if (!fonte) notFound();

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link href="/fontes" className="text-sm text-slate-500 hover:underline">
            ← Fontes
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">{fonte.titulo}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge>{fonte.tipo}</Badge>
            <Badge variant="secondary">{fonte.status}</Badge>
            {fonte.tema && <Badge variant="outline">{fonte.tema}</Badge>}
          </div>
        </div>
        <DeleteFonteButton id={fonte.id} />
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase text-slate-400">Autor</dt>
          <dd className="mt-1">{fonte.autor ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-slate-400">URL</dt>
          <dd className="mt-1">
            {fonte.url ? (
              <a
                href={fonte.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {fonte.url}
              </a>
            ) : (
              "—"
            )}
          </dd>
        </div>
      </dl>

      {fonte.conteudoBruto && (
        <div className="mt-8">
          <h2 className="text-sm font-medium uppercase text-slate-400">
            Conteúdo bruto
          </h2>
          <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed whitespace-pre-wrap dark:border-slate-800 dark:bg-slate-900">
            {fonte.conteudoBruto}
          </div>
        </div>
      )}
    </div>
  );
}
