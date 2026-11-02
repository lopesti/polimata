import { db } from "@/lib/db/client";
import { notas } from "@/lib/db/schema";
import { QuickCapture } from "@/components/inbox/quick-capture";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { desc, like, or, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

function todayKey() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function InboxPage() {
  const key = todayKey();
  const all = db.select().from(notas).orderBy(desc(notas.criadoEm)).limit(30).all();
  const daily = all.filter(
    (n) =>
      n.titulo?.startsWith(`Daily ${key}`) ||
      (n.tags as string[] | null)?.includes("daily")
  );

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold tracking-tight">Inbox · Daily</h1>
      <p className="mt-1 text-sm text-slate-500">
        Captura rápida · {key}
      </p>

      <div className="mt-6">
        <QuickCapture dailyKey={key} />
      </div>

      <h2 className="mt-10 text-sm font-semibold uppercase text-slate-400">
        Notas de hoje
      </h2>
      <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
        {daily.length === 0 && (
          <p className="text-sm text-slate-400">Nada capturado hoje ainda.</p>
        )}
        {daily.map((n) => (
          <li key={n.id} className="py-2">
            <Link href={`/notas/${n.id}`} className="font-medium hover:underline">
              {n.titulo ?? "Sem título"}
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="mt-8 text-sm font-semibold uppercase text-slate-400">
        Recentes
      </h2>
      <ul className="mt-3 space-y-1">
        {all.slice(0, 10).map((n) => (
          <li key={n.id} className="flex items-center gap-2 text-sm">
            <Link href={`/notas/${n.id}`} className="hover:underline">
              {n.titulo ?? "Sem título"}
            </Link>
            <Badge variant="outline">{n.tipo}</Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}
