"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Data = {
  outbound: { title: string; notaId: string | null; resolved: boolean }[];
  inbound: { id: string; titulo: string | null }[];
  unresolved: string[];
};

export function BacklinksPanel({ notaId }: { notaId: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/backlinks?notaId=${notaId}`);
    const json = await res.json();
    setData(json.data ?? null);
  }, [notaId]);

  useEffect(() => {
    load();
  }, [load]);

  async function sync() {
    setBusy(true);
    try {
      await fetch("/api/backlinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notaId }),
      });
      await load();
    } finally {
      setBusy(false);
    }
  }

  if (!data) {
    return <p className="text-xs text-slate-400">Carregando links…</p>;
  }

  return (
    <div className="rounded-lg border border-slate-200 p-4 text-sm dark:border-slate-800">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Wiki-links & backlinks
        </h3>
        <Button size="sm" variant="outline" onClick={sync} disabled={busy}>
          {busy ? "…" : "Sincronizar [[links]]"}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-medium text-slate-500">Sai desta nota</p>
          {data.outbound.length === 0 ? (
            <p className="text-xs text-slate-400">Nenhum [[link]] no texto</p>
          ) : (
            <ul className="space-y-1">
              {data.outbound.map((o) => (
                <li key={o.title}>
                  {o.resolved && o.notaId ? (
                    <Link
                      href={`/notas/${o.notaId}`}
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      [[{o.title}]]
                    </Link>
                  ) : (
                    <span className="text-amber-600">[[{o.title}]] (não resolvido)</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-slate-500">Apontam para cá</p>
          {data.inbound.length === 0 ? (
            <p className="text-xs text-slate-400">Nenhum backlink ainda</p>
          ) : (
            <ul className="space-y-1">
              {data.inbound.map((i) => (
                <li key={i.id}>
                  <Link
                    href={`/notas/${i.id}`}
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {i.titulo || i.id.slice(0, 8)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
