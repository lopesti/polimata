"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function QuickCapture({ dailyKey }: { dailyKey: string }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: `Daily ${dailyKey} · ${text.slice(0, 40)}`,
          tipo: "factual",
          status: "capturado",
          tags: ["daily", "inbox"],
          conteudoInicial: text,
        }),
      });
      if (res.ok) {
        setText("");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea
        className="min-h-[100px] w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
        placeholder="Captura rápida (ideia, citação, tarefa de estudo)…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button type="submit" disabled={loading || !text.trim()}>
        {loading ? "…" : "Capturar"}
      </Button>
    </form>
  );
}
