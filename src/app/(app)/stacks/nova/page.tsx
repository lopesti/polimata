"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const OBJETIVOS = ["compreender", "memorizar", "aplicar", "ensinar", "criar"] as const;

type Metodo = { id: string; nome: string; categoria: string };

export default function NovoStackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metodos, setMetodos] = useState<Metodo[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [form, setForm] = useState({
    nome: "",
    objetivo: "compreender" as (typeof OBJETIVOS)[number],
  });

  useEffect(() => {
    fetch("/api/metodos")
      .then((r) => r.json())
      .then((j) => setMetodos(j.data ?? []))
      .catch(() => {});
  }, []);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          objetivo: form.objetivo,
          metodoIds: selected,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError("Erro ao criar stack");
        return;
      }
      router.push("/stacks");
      router.refresh();
    } catch {
      setError("Falha de rede");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <Link href="/stacks" className="text-sm text-slate-500 hover:underline">
        ← Stacks
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Novo stack</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Nome *</label>
          <Input
            required
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            placeholder="Ex: Dominar Kahneman em 2 semanas"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Objetivo *</label>
          <select
            className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 text-sm dark:border-slate-700"
            value={form.objetivo}
            onChange={(e) =>
              setForm({
                ...form,
                objetivo: e.target.value as (typeof OBJETIVOS)[number],
              })
            }
          >
            {OBJETIVOS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Métodos ({selected.length} selecionados)
          </label>
          <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-slate-200 p-2 dark:border-slate-700">
            {metodos.map((m) => (
              <label
                key={m.id}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(m.id)}
                  onChange={() => toggle(m.id)}
                />
                <span>{m.nome}</span>
                <span className="text-xs text-slate-400">{m.categoria}</span>
              </label>
            ))}
            {metodos.length === 0 && (
              <p className="p-2 text-sm text-slate-400">
                Carregando métodos… (rode o seed se estiver vazio)
              </p>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Criando…" : "Criar stack"}
          </Button>
          <Link href="/stacks">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
