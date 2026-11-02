"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  notaId?: string;
  defaultFrente?: string;
  defaultVerso?: string;
};

export function CreateCardForm({ notaId, defaultFrente = "", defaultVerso = "" }: Props) {
  const router = useRouter();
  const [tipo, setTipo] = useState<"basico" | "cloze">("basico");
  const [frente, setFrente] = useState(defaultFrente);
  const [verso, setVerso] = useState(defaultVerso);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const body = {
        tipo,
        frente,
        verso: tipo === "cloze" ? frente : verso,
        notaId: notaId || null,
      };
      const res = await fetch("/api/perguntas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("fail");
      setMsg("Card criado!");
      setFrente("");
      setVerso("");
      router.refresh();
    } catch {
      setMsg("Erro ao criar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTipo("basico")}
          className={`rounded px-3 py-1 text-sm ${tipo === "basico" ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : "bg-slate-100 dark:bg-slate-800"}`}
        >
          Básico
        </button>
        <button
          type="button"
          onClick={() => setTipo("cloze")}
          className={`rounded px-3 py-1 text-sm ${tipo === "cloze" ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : "bg-slate-100 dark:bg-slate-800"}`}
        >
          Cloze
        </button>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">
          {tipo === "cloze" ? "Texto com {{c1::resposta}}" : "Frente"}
        </label>
        <textarea
          required
          className="min-h-[80px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
          value={frente}
          onChange={(e) => setFrente(e.target.value)}
          placeholder={
            tipo === "cloze"
              ? "O {{c1::Sistema 1}} é rápido e automático."
              : "O que é o Sistema 1?"
          }
        />
      </div>

      {tipo === "basico" && (
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Verso</label>
          <Input
            required
            value={verso}
            onChange={(e) => setVerso(e.target.value)}
            placeholder="Processo rápido, automático e emocional"
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading} size="sm">
          {loading ? "…" : "Criar card"}
        </Button>
        {msg && <span className="text-xs text-slate-500">{msg}</span>}
      </div>
    </form>
  );
}
