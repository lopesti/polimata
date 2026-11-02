"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parseCloze, clozeAnswer } from "@/lib/fsrs/scheduler";
import { cn } from "@/lib/utils";

type Card = {
  id: string;
  tipo: string;
  frente: string;
  verso: string;
  estado: string | null;
};

type Intervals = {
  again: string;
  hard: string;
  good: string;
  easy: string;
};

export function ReviewSession({ initialQueue }: { initialQueue: Card[] }) {
  const [queue, setQueue] = useState(initialQueue);
  const [revealed, setRevealed] = useState(false);
  const [intervals, setIntervals] = useState<Intervals | null>(null);
  const [busy, setBusy] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [done, setDone] = useState(0);

  const current = queue[0];

  const loadIntervals = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/revisao?preview=${id}`);
      const json = await res.json();
      setIntervals(json.data ?? null);
    } catch {
      setIntervals(null);
    }
  }, []);

  useEffect(() => {
    setRevealed(false);
    setStartedAt(Date.now());
    if (current) loadIntervals(current.id);
  }, [current?.id, loadIntervals]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!current || busy) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!revealed) setRevealed(true);
      }
      if (!revealed) return;
      if (e.key === "1") void rate(1);
      if (e.key === "2") void rate(2);
      if (e.key === "3") void rate(3);
      if (e.key === "4") void rate(4);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, revealed, busy]);

  async function rate(rating: 1 | 2 | 3 | 4) {
    if (!current || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/revisao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          perguntaId: current.id,
          rating,
          duracaoMs: Date.now() - startedAt,
        }),
      });
      if (!res.ok) throw new Error("fail");
      setDone((d) => d + 1);
      setQueue((q) => q.slice(1));
      setRevealed(false);
    } catch {
      alert("Erro ao registrar revisão");
    } finally {
      setBusy(false);
    }
  }

  if (!current) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-2xl font-bold">✓ Sessão concluída</p>
        <p className="mt-2 text-slate-500">
          {done} card{done !== 1 ? "s" : ""} revisado{done !== 1 ? "s" : ""}
        </p>
        <Button className="mt-6" onClick={() => window.location.reload()}>
          Atualizar fila
        </Button>
      </div>
    );
  }

  const isCloze = current.tipo === "cloze";
  const cloze = isCloze ? parseCloze(current.frente) : null;
  const frontDisplay = cloze ? cloze.display : current.frente;
  const backDisplay = isCloze ? clozeAnswer(current.frente) : current.verso;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between text-sm text-slate-500">
        <span>
          Restam {queue.length} · feitos {done}
        </span>
        <Badge variant="outline">{current.tipo}</Badge>
      </div>

      <div className="min-h-[200px] rounded-xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-950">
        <p className="whitespace-pre-wrap text-lg leading-relaxed">{frontDisplay}</p>

        {revealed && (
          <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">
            <p className="text-xs font-medium uppercase text-slate-400">Resposta</p>
            <p className="mt-2 whitespace-pre-wrap text-lg text-emerald-800 dark:text-emerald-300">
              {backDisplay}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6">
        {!revealed ? (
          <Button className="w-full" size="lg" onClick={() => setRevealed(true)}>
            Mostrar resposta <span className="ml-2 text-xs opacity-60">(Espaço)</span>
          </Button>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(
              [
                { r: 1 as const, label: "Again", sub: intervals?.again, color: "bg-red-600 hover:bg-red-700" },
                { r: 2 as const, label: "Hard", sub: intervals?.hard, color: "bg-orange-500 hover:bg-orange-600" },
                { r: 3 as const, label: "Good", sub: intervals?.good, color: "bg-emerald-600 hover:bg-emerald-700" },
                { r: 4 as const, label: "Easy", sub: intervals?.easy, color: "bg-sky-600 hover:bg-sky-700" },
              ] as const
            ).map((b) => (
              <button
                key={b.r}
                type="button"
                disabled={busy}
                onClick={() => rate(b.r)}
                className={cn(
                  "rounded-lg px-3 py-3 text-white transition disabled:opacity-50",
                  b.color
                )}
              >
                <span className="block text-sm font-semibold">
                  {b.r}. {b.label}
                </span>
                <span className="text-xs opacity-80">{b.sub ?? "…"}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        Atalhos: Espaço = revelar · 1–4 = rating
      </p>
    </div>
  );
}
