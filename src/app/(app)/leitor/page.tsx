import Link from "next/link";
import { db } from "@/lib/db/client";
import { fontes } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default function LeitorIndexPage() {
  const rows = db
    .select()
    .from(fontes)
    .orderBy(desc(fontes.criadoEm))
    .all()
    .filter((f) => f.conteudoBruto && f.conteudoBruto.length > 20);

  const all = db.select().from(fontes).orderBy(desc(fontes.criadoEm)).all();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold tracking-tight">Leitor</h1>
      <p className="mt-1 text-sm text-slate-500">
        Leitura normal · RSVP · TTS · Preview em 3 passadas
      </p>

      {rows.length === 0 ? (
        <div className="mt-12 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-slate-500">
            Nenhuma fonte com conteúdo bruto.
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Edite uma fonte e cole texto em “conteúdo bruto”, ou use o seed.
          </p>
          <Link
            href="/fontes"
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            Ir para Fontes →
          </Link>
          {all.length > 0 && (
            <ul className="mx-auto mt-8 max-w-md space-y-2 text-left text-sm">
              {all.map((f) => (
                <li key={f.id} className="flex justify-between rounded border border-slate-200 px-3 py-2 dark:border-slate-800">
                  <span>{f.titulo}</span>
                  <span className="text-slate-400">sem conteúdo</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-slate-100 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
          {rows.map((f) => (
            <li key={f.id}>
              <Link
                href={`/leitor/${f.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900/50"
              >
                <div>
                  <p className="font-medium">{f.titulo}</p>
                  <div className="mt-1 flex gap-2">
                    <Badge variant="outline">{f.tipo}</Badge>
                    {f.tema && <Badge variant="secondary">{f.tema}</Badge>}
                    <span className="text-xs text-slate-400">
                      {f.conteudoBruto!.split(/\s+/).length} palavras
                    </span>
                  </div>
                </div>
                <span className="text-xs text-slate-400">abrir leitor →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
