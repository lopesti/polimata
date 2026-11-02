"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Cmd = {
  id: string;
  label: string;
  href?: string;
  keys?: string;
  action?: () => void | Promise<void>;
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const router = useRouter();

  const commands: Cmd[] = useMemo(
    () => [
      { id: "inbox", label: "Ir para Inbox", href: "/inbox", keys: "g i" },
      { id: "fontes", label: "Ir para Fontes", href: "/fontes", keys: "g f" },
      { id: "notas", label: "Ir para Notas", href: "/notas", keys: "g n" },
      { id: "revisao", label: "Iniciar revisão", href: "/revisao", keys: "g r" },
      { id: "fsrs-stats", label: "Dashboard de revisão (FSRS)", href: "/revisao/dashboard" },
      { id: "leitor", label: "Ir para Leitor", href: "/leitor", keys: "g l" },
      { id: "stacks", label: "Ir para Stacks", href: "/stacks", keys: "g s" },
      { id: "dashboard", label: "Dashboard geral", href: "/dashboard", keys: "g d" },
      { id: "diario", label: "Diário metacognitivo", href: "/diario" },
      { id: "grafo", label: "Grafo", href: "/grafo" },
      { id: "query", label: "Query language", href: "/query" },
      { id: "playlist", label: "Playlist de áudio", href: "/playlist" },
      { id: "config", label: "Configurações", href: "/config" },
      { id: "metodos", label: "Biblioteca de métodos", href: "/metodos" },
      {
        id: "export-json",
        label: "Export JSON (backup)",
        action: () => window.open("/api/export", "_blank"),
      },
      {
        id: "export-obsidian",
        label: "Export Obsidian (Markdown)",
        action: () => window.open("/api/export/obsidian", "_blank"),
      },
      {
        id: "export-anki",
        label: "Export Anki (TSV)",
        action: () => window.open("/api/anki/export", "_blank"),
      },
      { id: "canvas", label: "Canvas visual", href: "/canvas" },
      {
        id: "rebuild-fts",
        label: "Reindexar busca (FTS5)",
        action: async () => {
          await fetch("/api/busca?rebuild=1");
          alert("Índice FTS reconstruído");
        },
      },
      {
        id: "motor-learn",
        label: "Motor: aprender com diário/sessões",
        action: async () => {
          const res = await fetch("/api/motor/aprender", { method: "POST" });
          const json = await res.json();
          const n = json.data?.adjusted?.length ?? 0;
          alert(n ? `Ajustados ${n} métodos` : "Nenhum ajuste necessário");
        },
      },
      {
        id: "nova-nota",
        label: "Nova nota",
        href: "/notas/nova",
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return commands.filter(
      (c) => c.label.toLowerCase().includes(s) || c.id.includes(s)
    );
  }, [q, commands]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setOpen((o) => !o);
        setQ("");
        setIdx(0);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => setIdx(0), [q]);

  if (!open) return null;

  async function run(c: Cmd) {
    setOpen(false);
    if (c.action) await c.action();
    else if (c.href) router.push(c.href);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 pt-[15vh] p-4">
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setIdx((i) => Math.min(filtered.length - 1, i + 1));
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setIdx((i) => Math.max(0, i - 1));
          }
          if (e.key === "Enter" && filtered[idx]) void run(filtered[idx]!);
        }}
      >
        <input
          autoFocus
          className="w-full border-b border-slate-200 bg-transparent px-4 py-3 text-sm outline-none dark:border-slate-700"
          placeholder="Comando ou ação… (Ctrl+P)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <ul className="max-h-80 overflow-y-auto py-1">
          {filtered.length === 0 && (
            <li className="px-4 py-3 text-sm text-slate-400">Nenhum comando</li>
          )}
          {filtered.map((c, i) => (
            <li key={c.id}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-between px-4 py-2 text-left text-sm",
                  i === idx
                    ? "bg-slate-100 dark:bg-slate-800"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )}
                onMouseEnter={() => setIdx(i)}
                onClick={() => void run(c)}
              >
                <span>{c.label}</span>
                {c.keys && (
                  <kbd className="text-[10px] text-slate-400">{c.keys}</kbd>
                )}
                {c.action && !c.href && (
                  <span className="text-[10px] text-slate-400">ação</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
