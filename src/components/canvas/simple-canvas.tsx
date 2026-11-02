"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Card = {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
};

const COLORS = ["#fef3c7", "#dbeafe", "#dcfce7", "#fce7f3", "#e2e8f0"];
const STORAGE = "polimata-canvas-v1";

export function SimpleCanvas() {
  const [cards, setCards] = useState<Card[]>([]);
  const [drag, setDrag] = useState<{ id: string; ox: number; oy: number } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) setCards(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify(cards));
  }, [cards]);

  function add() {
    setCards((c) => [
      ...c,
      {
        id: crypto.randomUUID(),
        x: 40 + Math.random() * 200,
        y: 40 + Math.random() * 120,
        text: "Nova ideia",
        color: COLORS[c.length % COLORS.length]!,
      },
    ]);
  }

  function onMove(e: React.MouseEvent) {
    if (!drag) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left - drag.ox;
    const y = e.clientY - rect.top - drag.oy;
    setCards((cs) =>
      cs.map((c) => (c.id === drag.id ? { ...c, x, y } : c))
    );
  }

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <Button size="sm" onClick={add}>
          + Card
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setCards([])}
        >
          Limpar
        </Button>
      </div>
      <div
        className="relative h-[520px] overflow-hidden rounded-xl border border-slate-200 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-[size:16px_16px] dark:border-slate-800 dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)]"
        onMouseMove={onMove}
        onMouseUp={() => setDrag(null)}
        onMouseLeave={() => setDrag(null)}
      >
        {cards.map((c) => (
          <div
            key={c.id}
            style={{ left: c.x, top: c.y, background: c.color }}
            className="absolute w-44 cursor-grab rounded-lg border border-black/5 p-2 shadow-sm active:cursor-grabbing"
            onMouseDown={(e) => {
              const rect = (e.target as HTMLElement).closest("div")!.getBoundingClientRect();
              setDrag({
                id: c.id,
                ox: e.clientX - rect.left,
                oy: e.clientY - rect.top,
              });
            }}
          >
            <textarea
              className="h-24 w-full resize-none bg-transparent text-sm outline-none"
              value={c.text}
              onChange={(e) =>
                setCards((cs) =>
                  cs.map((x) =>
                    x.id === c.id ? { ...x, text: e.target.value } : x
                  )
                )
              }
            />
            <button
              type="button"
              className="text-[10px] text-slate-500"
              onClick={() => setCards((cs) => cs.filter((x) => x.id !== c.id))}
            >
              remover
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
