"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const TIPOS = ["artigo", "livro", "video", "pdf", "podcast", "web", "outro"] as const;
const STATUS = ["capturado", "triado", "processado", "testado", "dominado"] as const;

export default function NovaFontePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    titulo: "",
    autor: "",
    tipo: "artigo" as (typeof TIPOS)[number],
    url: "",
    tema: "",
    status: "capturado" as (typeof STATUS)[number],
    conteudoBruto: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/fontes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          url: form.url || null,
          autor: form.autor || null,
          tema: form.tema || null,
          conteudoBruto: form.conteudoBruto || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : "Erro ao criar");
        return;
      }
      router.push(`/fontes/${json.data.id}`);
      router.refresh();
    } catch {
      setError("Falha de rede");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-6">
        <Link href="/fontes" className="text-sm text-slate-500 hover:underline">
          ← Fontes
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Nova fonte</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Título *</label>
          <Input
            required
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            placeholder="Ex: Thinking, Fast and Slow"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Autor</label>
            <Input
              value={form.autor}
              onChange={(e) => setForm({ ...form, autor: e.target.value })}
              placeholder="Nome do autor"
            />
          </div>
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
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">URL</label>
            <Input
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Tema</label>
            <Input
              value={form.tema}
              onChange={(e) => setForm({ ...form, tema: e.target.value })}
              placeholder="Ex: Psicologia cognitiva"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Status</label>
          <select
            className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 text-sm dark:border-slate-700"
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as (typeof STATUS)[number] })
            }
          >
            {STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Conteúdo bruto</label>
          <textarea
            className="min-h-[140px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            value={form.conteudoBruto}
            onChange={(e) => setForm({ ...form, conteudoBruto: e.target.value })}
            placeholder="Cole o texto extraído aqui..."
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando…" : "Criar fonte"}
          </Button>
          <Link href="/fontes">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
