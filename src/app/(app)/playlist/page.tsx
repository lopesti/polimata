"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTTS } from "@/hooks/useTTS";
import { Play, Square, SkipForward } from "lucide-react";

type Item = {
  id: string;
  tipo: string;
  titulo: string;
  texto: string;
};

export default function PlaylistPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [cursor, setCursor] = useState(0);
  const tts = useTTS();

  useEffect(() => {
    fetch("/api/playlist")
      .then((r) => r.json())
      .then((j) => setItems(j.data ?? []));
  }, []);

  function playFrom(i: number) {
    setCursor(i);
    const item = items[i];
    if (!item) return;
    tts.speak(item.texto);
  }

  function playQueue(start = 0) {
    if (start >= items.length) return;
    setCursor(start);
    const item = items[start];
    if (!item) return;
    // use TTS speak; poll speaking state is weak — chain with setTimeout estimate
    tts.speak(item.texto);
    // approximate duration: words / (rate * 2.5 words/sec)
    const words = item.texto.split(/\s+/).length;
    const sec = Math.max(4, words / (tts.rate * 2.2));
    window.setTimeout(() => {
      if (start + 1 < items.length) playQueue(start + 1);
    }, sec * 1000);
  }

  function playAll() {
    if (!items.length) return;
    playQueue(0);
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold tracking-tight">Playlist de áudio</h1>
      <p className="mt-1 text-sm text-slate-500">
        Notas recentes + cards due · TTS Web Speech · tempo morto = revisão
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={playAll} disabled={!items.length || tts.speaking}>
          <Play className="mr-2 h-4 w-4" /> Tocar fila
        </Button>
        {tts.speaking && (
          <Button variant="secondary" onClick={tts.stop}>
            <Square className="mr-2 h-4 w-4" /> Parar
          </Button>
        )}
        <Button
          variant="outline"
          disabled={cursor >= items.length - 1}
          onClick={() => playFrom(cursor + 1)}
        >
          <SkipForward className="mr-2 h-4 w-4" /> Próximo
        </Button>
        <label className="flex items-center gap-2 text-xs text-slate-500">
          vel.
          <input
            type="range"
            min={0.8}
            max={2.2}
            step={0.1}
            value={tts.rate}
            onChange={(e) => tts.setRate(Number(e.target.value))}
          />
          {tts.rate.toFixed(1)}x
        </label>
      </div>

      <ul className="mt-6 divide-y divide-slate-100 dark:divide-slate-800">
        {items.length === 0 && (
          <p className="text-sm text-slate-400">
            Fila vazia — crie notas ou cards primeiro.
          </p>
        )}
        {items.map((item, i) => (
          <li
            key={`${item.tipo}-${item.id}`}
            className={`flex items-center justify-between py-3 ${
              i === cursor && tts.speaking ? "bg-slate-50 dark:bg-slate-900" : ""
            }`}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{item.titulo}</p>
              <p className="text-[10px] uppercase text-slate-400">{item.tipo}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => playFrom(i)}>
              <Play className="h-3.5 w-3.5" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
