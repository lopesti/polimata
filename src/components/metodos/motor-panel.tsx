"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Result = {
  nome: string;
  justificativa: string;
  metodos: { nome: string; motivo: string; metodoId: string | null }[];
  stackId: string | null;
};

export function MotorPanel() {
  const router = useRouter();
  const [tipo, setTipo] = useState("conceitual");
  const [objetivo, setObjetivo] = useState("compreender");
  const [prazoDias, setPrazoDias] = useState(14);
  const [titulo, setTitulo] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  async function run(aplicar: boolean) {
    setLoading(true);
    try {
      const res = await fetch("/api/motor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          objetivo,
          prazoDias,
          titulo: titulo || undefined,
          aplicar,
        }),
      });
      const json = await res.json();
      setResult(json.data);
      if (aplicar && json.data?.stackId) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
      <h3 className="font-semibold">Motor de sugestão</h3>
      <p className="mt-1 text-xs text-slate-500">
        Regras: tipo + objetivo + prazo → stack sugerido
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Tipo
          <select
            className="mt-1 flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-2 text-sm dark:border-slate-700"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            {["factual", "conceitual", "procedural", "abstrato", "misto"].map(
              (t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              )
            )}
          </select>
        </label>
        <label className="text-sm">
          Objetivo
          <select
            className="mt-1 flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-2 text-sm dark:border-slate-700"
            value={objetivo}
            onChange={(e) => setObjetivo(e.target.value)}
          >
            {["compreender", "memorizar", "aplicar", "ensinar", "criar"].map(
              (t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              )
            )}
          </select>
        </label>
        <label className="text-sm">
          Prazo (dias)
          <input
            type="number"
            className="mt-1 flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-2 text-sm dark:border-slate-700"
            value={prazoDias}
            onChange={(e) => setPrazoDias(Number(e.target.value))}
          />
        </label>
        <label className="text-sm">
          Título (opcional)
          <input
            className="mt-1 flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-2 text-sm dark:border-slate-700"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Kahneman cap. 1"
          />
        </label>
      </div>

      <div className="mt-3 flex gap-2">
        <Button
          type="button"
          disabled={loading}
          onClick={() => run(false)}
          variant="outline"
        >
          Sugerir
        </Button>
        <Button type="button" disabled={loading} onClick={() => run(true)}>
          Sugerir e criar stack
        </Button>
      </div>

      {result && (
        <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm dark:bg-slate-900">
          <p className="font-medium">{result.nome}</p>
          <p className="mt-1 text-xs text-slate-500">{result.justificativa}</p>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            {result.metodos.map((m, i) => (
              <li key={i}>
                {m.nome}{" "}
                <span className="text-xs text-slate-400">— {m.motivo}</span>
              </li>
            ))}
          </ol>
          {result.stackId && (
            <p className="mt-2 text-xs text-emerald-600">Stack criado no banco.</p>
          )}
        </div>
      )}
    </div>
  );
}
