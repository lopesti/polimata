"use client";

import { useTTS } from "@/hooks/useTTS";
import { Button } from "@/components/ui/button";
import { Volume2, Square } from "lucide-react";

type Props = { text: string; label?: string };

export function TtsPlayer({ text, label = "Ouvir" }: Props) {
  const tts = useTTS();

  if (!tts.supported) {
    return (
      <p className="text-xs text-slate-400">
        TTS não suportado neste navegador (Web Speech API).
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {tts.speaking ? (
        <Button variant="secondary" onClick={tts.stop}>
          <Square className="mr-2 h-3.5 w-3.5" />
          Parar
          {tts.progress.total > 1 && (
            <span className="ml-2 text-xs opacity-70">
              {tts.progress.i + 1}/{tts.progress.total}
            </span>
          )}
        </Button>
      ) : (
        <Button
          variant="secondary"
          onClick={() => tts.speak(text)}
          disabled={!text.trim()}
        >
          <Volume2 className="mr-2 h-3.5 w-3.5" />
          {label}
        </Button>
      )}
      <label className="flex items-center gap-2 text-xs text-slate-500">
        velocidade
        <input
          type="range"
          min={0.7}
          max={2.5}
          step={0.1}
          value={tts.rate}
          onChange={(e) => tts.setRate(Number(e.target.value))}
          className="w-24"
        />
        <span>{tts.rate.toFixed(1)}x</span>
      </label>
    </div>
  );
}
