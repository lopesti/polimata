"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoadSimulator() {
  const [newPerDay, setNewPerDay] = useState(10);
  const [days, setDays] = useState(30);
  const [result, setResult] = useState<{
    peak: number;
    warning: boolean;
    points: { day: number; total: number; reviews: number; newCards: number }[];
  } | null>(null);

  async function run() {
    const res = await fetch(
      `/api/simular?newPerDay=${newPerDay}&days=${days}`
    );
    const json = await res.json();
    setResult(json.data);
  }

  const max = Math.max(1, ...(result?.points.map((p) => p.total) ?? [1]));

  return (
    <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
      <h3 className="text-sm font-semibold">Simulador de carga</h3>
      <p className="mt-1 text-xs text-slate-500">
        E se eu adicionar N cards novos por dia?
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <label className="text-xs">
          Novos/dia
          <Input
            type="number"
            className="mt-1 w-24"
            value={newPerDay}
            onChange={(e) => setNewPerDay(Number(e.target.value))}
          />
        </label>
        <label className="text-xs">
          Dias
          <Input
            type="number"
            className="mt-1 w-24"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          />
        </label>
        <Button size="sm" onClick={run}>
          Simular
        </Button>
      </div>
      {result && (
        <div className="mt-4">
          <p className="text-sm">
            Pico estimado: <strong>{result.peak}</strong> cards/dia
            {result.warning && (
              <span className="ml-2 text-red-600">— risco de overload</span>
            )}
          </p>
          <div className="mt-2 flex h-16 items-end gap-px">
            {result.points.map((p) => (
              <div
                key={p.day}
                title={`D${p.day}: ${p.total}`}
                className="flex-1 rounded-t bg-slate-700 dark:bg-slate-300"
                style={{ height: `${(p.total / max) * 100}%` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
