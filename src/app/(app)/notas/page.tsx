import Link from "next/link";
import { db } from "@/lib/db/client";
import { notas } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

const statusVariant: Record<string, "default" | "secondary" | "success" | "warning" | "outline"> = {
  capturado: "secondary",
  triado: "outline",
  processado: "default",
  testado: "warning",
  revisado: "default",
  aplicado: "success",
  dominado: "success",
};

export default function NotasPage() {
  const rows = db.select().from(notas).orderBy(desc(notas.criadoEm)).all();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notas</h1>
          <p className="mt-1 text-sm text-slate-500">
            Blocos atômicos e referenciáveis · {rows.length} notas
          </p>
        </div>
        <Link href="/notas/nova">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova nota
          </Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-slate-500">Nenhuma nota ainda.</p>
          <Link href="/notas/nova" className="mt-4 inline-block">
            <Button variant="outline">Criar a primeira nota</Button>
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-slate-100 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
          {rows.map((n) => (
            <li key={n.id}>
              <Link
                href={`/notas/${n.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900/50"
              >
                <div>
                  <p className="font-medium">{n.titulo ?? "Sem título"}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge variant="outline">{n.tipo}</Badge>
                    <Badge variant={statusVariant[n.status ?? "capturado"] ?? "secondary"}>
                      {n.status}
                    </Badge>
                    {(n.tags as string[] | null)?.slice(0, 3).map((t) => (
                      <Badge key={t} variant="secondary">
                        #{t}
                      </Badge>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-slate-400">abrir →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
