"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pomodoro } from "@/components/sessoes/pomodoro";

type Sessao = {
  id: string;
  duracao: number | null;
  dificuldade: number | null;
  acertos: number | null;
  erros: number | null;
  data: string | Date | null;
};

export default function SessoesPage() {
  const [rows, setRows] = useState<Sessao[]>([]);
  const [form, setForm] = useState({
    duracao: 25,
    dificuldade: 3,
    acertos: 0,
    erros: 0,
  });

  async function load() {
    const res = await fetch("/api/sessoes");
    const json = await res.json();
    setRows(json.data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/sessoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    await load();
  }

  return (
    <div className="mx-auto max-w-xl p-8">
      <h1 className="text-2xl font-bold">Sessões</h1>
      <p className="mt-1 text-sm text-slate-500">Registro manual de estudo</p>

      <div className="mt-6">
        <Pomodoro
          onComplete={async (minutes) => {
            await fetch("/api/sessoes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ duracao: minutes, dificuldade: 3, acertos: 0, erros: 0 }),
            });
            load();
          }}
        />
      </div>

      <form onSubmit={submit} className="mt-6 grid grid-cols-2 gap-3 rounded-lg border p-4 dark:border-slate-800">
        <label className="text-sm">
          Duração (min)
          <Input
            type="number"
            value={form.duracao}
            onChange={(e) => setForm({ ...form, duracao: Number(e.target.value) })}
          />
        </label>
        <label className="text-sm">
          Dificuldade 1–5
          <Input
            type="number"
            min={1}
            max={5}
            value={form.dificuldade}
            onChange={(e) =>
              setForm({ ...form, dificuldade: Number(e.target.value) })
            }
          />
        </label>
        <label className="text-sm">
          Acertos
          <Input
            type="number"
            value={form.acertos}
            onChange={(e) => setForm({ ...form, acertos: Number(e.target.value) })}
          />
        </label>
        <label className="text-sm">
          Erros
          <Input
            type="number"
            value={form.erros}
            onChange={(e) => setForm({ ...form, erros: Number(e.target.value) })}
          />
        </label>
        <Button type="submit" className="col-span-2">
          Registrar sessão
        </Button>
      </form>

      <ul className="mt-6 space-y-2 text-sm">
        {rows.map((s) => (
          <li key={s.id} className="flex justify-between border-b border-slate-100 py-2 dark:border-slate-800">
            <span>
              {s.duracao} min · d{s.dificuldade} · ✓{s.acertos} ✗{s.erros}
            </span>
            <span className="text-xs text-slate-400">
              {s.data ? new Date(s.data).toLocaleString("pt-BR") : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
