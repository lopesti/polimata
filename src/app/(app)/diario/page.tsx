"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Entry = {
  id: string;
  data: string | Date | null;
  oQueFuncionou: string | null;
  oQueAjustar: string | null;
  humor: number | null;
  metodosTestados: string[] | null;
};

export default function DiarioPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [form, setForm] = useState({
    oQueFuncionou: "",
    oQueAjustar: "",
    humor: 3,
  });
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/diario");
    const json = await res.json();
    setEntries(json.data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/diario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm({ oQueFuncionou: "", oQueAjustar: "", humor: 3 });
      await load();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold tracking-tight">Diário metacognitivo</h1>
      <p className="mt-1 text-sm text-slate-500">
        O que funcionou · o que ajustar · humor
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        <div>
          <label className="mb-1 block text-sm font-medium">O que funcionou</label>
          <textarea
            className="min-h-[80px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            value={form.oQueFuncionou}
            onChange={(e) => setForm({ ...form, oQueFuncionou: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">O que ajustar</label>
          <textarea
            className="min-h-[80px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            value={form.oQueAjustar}
            onChange={(e) => setForm({ ...form, oQueAjustar: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Humor: {form.humor}/5</label>
          <input
            type="range"
            min={1}
            max={5}
            value={form.humor}
            onChange={(e) => setForm({ ...form, humor: Number(e.target.value) })}
            className="w-full"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando…" : "Registrar"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              const res = await fetch("/api/motor/aprender", { method: "POST" });
              const json = await res.json();
              const n = json.data?.adjusted?.length ?? 0;
              alert(n ? `Motor ajustou ${n} método(s)` : "Sem ajustes");
            }}
          >
            Aplicar no motor
          </Button>
        </div>
      </form>

      <ul className="mt-8 space-y-4">
        {entries.map((e) => (
          <li
            key={e.id}
            className="rounded-lg border border-slate-200 p-4 text-sm dark:border-slate-800"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {e.data ? new Date(e.data).toLocaleString("pt-BR") : ""}
              </span>
              {e.humor != null && <Badge variant="secondary">humor {e.humor}</Badge>}
            </div>
            {e.oQueFuncionou && (
              <p>
                <strong>Funcionou:</strong> {e.oQueFuncionou}
              </p>
            )}
            {e.oQueAjustar && (
              <p className="mt-1">
                <strong>Ajustar:</strong> {e.oQueAjustar}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
