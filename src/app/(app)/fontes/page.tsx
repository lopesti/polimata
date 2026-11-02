import Link from "next/link";
import { db } from "@/lib/db/client";
import { fontes } from "@/lib/db/schema";
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
  dominado: "success",
};

export default function FontesPage() {
  const rows = db.select().from(fontes).orderBy(desc(fontes.criadoEm)).all();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fontes</h1>
          <p className="mt-1 text-sm text-slate-500">
            Material capturado para estudo · {rows.length} fontes
          </p>
        </div>
        <Link href="/fontes/nova">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova fonte
          </Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-slate-500">Nenhuma fonte ainda.</p>
          <Link href="/fontes/nova" className="mt-4 inline-block">
            <Button variant="outline">Capturar a primeira fonte</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left dark:bg-slate-900">
              <tr>
                <th className="px-4 py-3 font-medium">Título</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Tema</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Autor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((f) => (
                <tr
                  key={f.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-900/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/fontes/${f.id}`}
                      className="font-medium hover:underline"
                    >
                      {f.titulo}
                    </Link>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-600">
                    {f.tipo}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{f.tema ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[f.status ?? "capturado"] ?? "secondary"}>
                      {f.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{f.autor ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
