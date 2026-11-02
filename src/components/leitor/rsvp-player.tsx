"use client";

import { useRSVP } from "@/hooks/useRSVP";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { estimateDurationMs } from "@/lib/rsvp/engine";

type Props = { text: string };

export function RsvpPlayer({ text }: Props) {
  const r = useRSVP(text);

  const eta = estimateDurationMs(r.wordCount, r.wpm);
  const etaSec = Math.round(eta / 1000);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
        <span>
          {r.wordCount} palavras · ~{etaSec}s a {r.wpm} ppm
        </span>
        <span>
          {r.index + 1}/{r.chunks.length || 1}
        </span>
      </div>

      {/* Focus word */}
      <div className="flex h-28 items-center justify-center rounded-lg bg-white dark:bg-slate-950">
        <p
          className="max-w-full truncate px-4 text-center text-3xl font-medium tracking-tight tabular-nums sm:text-4xl"
          key={r.index}
        >
          {r.current || "—"}
        </p>
      </div>

      {/* Progress */}
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-slate-900 transition-all dark:bg-slate-100"
          style={{ width: `${Math.round(r.progress * 100)}%` }}
        />
      </div>

      {/* Controls */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => r.seek(r.index - 1)}
          title="Anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {r.playing ? (
          <Button onClick={r.pause} size="lg">
            <Pause className="mr-2 h-4 w-4" /> Pause
          </Button>
        ) : (
          <Button onClick={r.play} size="lg">
            <Play className="mr-2 h-4 w-4" /> Play
          </Button>
        )}
        <Button variant="outline" size="icon" onClick={r.reset} title="Reiniciar">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => r.seek(r.index + 1)}
          title="Próximo"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Settings */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-slate-500">Velocidade: {r.wpm} ppm</span>
          <input
            type="range"
            min={200}
            max={800}
            step={25}
            value={r.wpm}
            onChange={(e) => r.setWpm(Number(e.target.value))}
            className="mt-1 w-full"
          />
        </label>
        <label className="block text-sm">
          <span className="text-slate-500">Chunk: {r.chunkSize} palavra(s)</span>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={r.chunkSize}
            onChange={(e) => r.setChunkSize(Number(e.target.value))}
            className="mt-1 w-full"
          />
        </label>
      </div>
    </div>
  );
}
