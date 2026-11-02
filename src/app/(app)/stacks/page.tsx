import Link from "next/link";
import { db } from "@/lib/db/client";
import { stacks } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MotorPanel } from "@/components/metodos/motor-panel";

export const dynamic = "force-dynamic";

export default function StacksPage() {
  const rows = db.select().from(stacks).orderBy(desc(stacks.criadoEm)).all();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Method Stacks</h1>
          <p className="mt-1 text-sm text-slate-500">
            Combine métodos por objetivo · {rows.length} stacks
          </p>
        </div>
        <Link href="/stacks/nova">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo stack
          </Button>
        </Link>
      </div>

      <div className="mt-8">
        <MotorPanel />
      </div>

      {rows.length === 0 ? (
        <p className="mt-12 text-center text-slate-500">
          Nenhum stack ainda. Monte uma sequência de métodos para um objetivo.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.map((s) => (
            <li
              key={s.id}
              className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-medium">{s.nome}</h2>
                <div className="flex gap-2">
                  <Badge variant="outline">{s.objetivo}</Badge>
                  <Badge variant="secondary">{s.status}</Badge>
                </div>
              </div>
              <p className="mt-1 text-xs text-slate-400">modo: {s.modo}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
