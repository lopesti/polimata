"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, BookOpen, Layers, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Hit = {
  objeto_tipo: string;
  objeto_id: string;
  titulo: string;
  snippet: string;
};

const typeIcon: Record<string, typeof FileText> = {
  nota: FileText,
  fonte: BookOpen,
  metodo: Layers,
  bloco: FileText,
};

const typeHref = (tipo: string, id: string) => {
  if (tipo === "nota") return `/notas/${id}`;
  if (tipo === "bloco") return `/notas`; // bloco → lista (MVP)
  if (tipo === "fonte") return `/fontes/${id}`;
  if (tipo === "metodo") return `/metodos`;
  if (tipo === "pergunta") return `/revisao`;
  return "/";
};

export function Topbar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setHits([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/busca?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      setHits(json.data ?? []);
      setOpen(true);
    } catch {
      setHits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => search(q), 200);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q, search]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("polimata-search")?.focus();
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function go(hit: Hit) {
    setOpen(false);
    setQ("");
    if (hit.objeto_tipo === "bloco") {
      // blocos are indexed with their own id; try to open parent via search context later
      router.push("/notas");
      return;
    }
    if (hit.objeto_tipo === "nota") router.push(`/notas/${hit.objeto_id}`);
    else if (hit.objeto_tipo === "fonte") router.push(`/fontes/${hit.objeto_id}`);
    else if (hit.objeto_tipo === "metodo") router.push("/metodos");
  }

  return (
    <header className="relative flex h-14 items-center gap-4 border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-950">
      <div className="relative flex-1 max-w-lg" ref={boxRef}>
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          id="polimata-search"
          placeholder="Buscar fontes, notas, métodos… (Ctrl+K)"
          className="pl-9 pr-8"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => hits.length > 0 && setOpen(true)}
          autoComplete="off"
        />
        {q && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            onClick={() => {
              setQ("");
              setHits([]);
              setOpen(false);
            }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {open && (q.trim().length > 0) && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
            {loading && (
              <p className="p-3 text-sm text-slate-400">Buscando…</p>
            )}
            {!loading && hits.length === 0 && (
              <p className="p-3 text-sm text-slate-400">
                Nenhum resultado. Tente reindexar:{" "}
                <button
                  type="button"
                  className="underline"
                  onClick={() =>
                    fetch("/api/busca?rebuild=1").then(() => search(q))
                  }
                >
                  rebuild FTS
                </button>
              </p>
            )}
            {!loading &&
              hits.map((hit) => {
                const Icon = typeIcon[hit.objeto_tipo] ?? FileText;
                return (
                  <button
                    key={`${hit.objeto_tipo}-${hit.objeto_id}`}
                    type="button"
                    onClick={() => go(hit)}
                    className={cn(
                      "flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {hit.titulo || "(sem título)"}
                      </p>
                      <p
                        className="truncate text-xs text-slate-400"
                        dangerouslySetInnerHTML={{ __html: hit.snippet }}
                      />
                      <p className="text-[10px] uppercase text-slate-400">
                        {hit.objeto_tipo}
                      </p>
                    </div>
                  </button>
                );
              })}
          </div>
        )}
      </div>
      <div className="text-xs text-slate-400">FTS5 · local</div>
    </header>
  );
}
