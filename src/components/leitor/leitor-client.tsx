"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RsvpPlayer } from "./rsvp-player";
import { TtsPlayer } from "./tts-player";
import { HighlightReader } from "./highlight-reader";
import { Preview3Pass } from "./preview-3pass";
import { cn } from "@/lib/utils";

type Mode = "ler" | "rsvp" | "preview" | "audio";

type Props = {
  fonteId: string;
  titulo: string;
  text: string;
};

export function LeitorClient({ fonteId, titulo, text }: Props) {
  const [mode, setMode] = useState<Mode>("ler");
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  async function createNotaFromSelection(selection: string) {
    setCreating(true);
    try {
      const res = await fetch("/api/notas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: selection.slice(0, 80) + (selection.length > 80 ? "…" : ""),
          tipo: "factual",
          status: "capturado",
          fonteId,
          tags: ["highlight"],
          conteudoInicial: selection,
        }),
      });
      const json = await res.json();
      if (res.ok && json.data?.id) {
        router.push(`/notas/${json.data.id}`);
      }
    } finally {
      setCreating(false);
    }
  }

  const tabs: { id: Mode; label: string }[] = [
    { id: "ler", label: "Ler" },
    { id: "rsvp", label: "RSVP" },
    { id: "preview", label: "3 passadas" },
    { id: "audio", label: "Áudio" },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setMode(t.id)}
            className={cn(
              "rounded-full px-3 py-1 text-sm transition",
              mode === t.id
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            )}
          >
            {t.label}
          </button>
        ))}
        {creating && (
          <span className="text-xs text-slate-400">Criando nota…</span>
        )}
      </div>

      {mode === "ler" && (
        <HighlightReader text={text} onCreateNota={createNotaFromSelection} />
      )}
      {mode === "rsvp" && <RsvpPlayer text={text} />}
      {mode === "preview" && <Preview3Pass text={text} />}
      {mode === "audio" && (
        <div className="space-y-4 rounded-lg border border-slate-200 p-6 dark:border-slate-800">
          <p className="text-sm text-slate-500">
            TTS via Web Speech API · voz pt-BR quando disponível. Áudio é
            revisão do que já foi destilado — aqui usamos o conteúdo da fonte
            como MVP.
          </p>
          <TtsPlayer text={text} label={`Ouvir “${titulo.slice(0, 40)}”`} />
          <p className="text-xs text-slate-400">
            Dica: use notas curtas no player de áudio (Módulo completo de
            playlist virá depois).
          </p>
        </div>
      )}
    </div>
  );
}
