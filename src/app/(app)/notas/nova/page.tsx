"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TIPOS = ["factual", "conceitual", "procedural", "abstrato"] as const;
const STATUS = [
  "capturado",
  "triado",
  "processado",
  "testado",
  "revisado",
  "aplicado",
  "dominado",
] as const;

export default function NovaNotaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    titulo: "",
    tipo: "conceitual" as (typeof TIPOS)[number],
    status: "capturado" as (typeof STATUS)[number],
    tags: "",
    conteudoInicial: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/notas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: form.titulo || null,
          tipo: form.tipo,
          status: form.status,
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          conteudoInicial: form.conteudoInicial || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : "Erro ao criar");
        return;
      }
      router.push(`/notas/${json.data.id}`);
      router.refresh();
    } catch {
      setError("Falha de rede");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <Link href="/notas" className="text-sm text-slate-500 hover:underline">
        ← Notas
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Nova nota</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Título</label>
          <Input
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            placeholder="Ex: Sistema 1 vs Sistema 2"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Tipo *</label>
            <select
              className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 text-sm dark:border-slate-700"
              value={form.tipo}
              onChange={(e) =>
                setForm({ ...form, tipo: e.target.value as (typeof TIPOS)[number] })
              }
            >
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Status</label>
            <select
              className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 text-sm dark:border-slate-700"
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as (typeof STATUS)[number],
                })
              }
            >
              {STATUS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Tags (separadas por vírgula)
          </label>
          <Input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="kahneman, dual-process"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Conteúdo inicial</label>
          <textarea
            className="min-h-[120px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            value={form.conteudoInicial}
            onChange={(e) => setForm({ ...form, conteudoInicial: e.target.value })}
            placeholder="Primeiro parágrafo da nota…"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Criando…" : "Criar nota"}
          </Button>
          <Link href="/notas">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
