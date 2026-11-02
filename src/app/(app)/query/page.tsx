"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EXAMPLES = [
  'LIST notas WHERE tipo = "conceitual"',
  'LIST fontes WHERE tipo = "livro"',
  "TABLE metodos WHERE eficaciaPessoal > 3",
  'COUNT perguntas WHERE estado = "novo"',
  "LIST stacks",
];

export default function QueryPage() {
  const [q, setQ] = useState(EXAMPLES[0]!);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function run(query = q) {
    setLoading(true);
    try {
      const res = await fetch(`/api/query?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      setResult(json.data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-bold tracking-tight">Query</h1>
      <p className="mt-1 text-sm text-slate-500">
        Mini linguagem estilo Dataview · LIST / TABLE / COUNT
      </p>

      <div className="mt-4 flex gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          className="font-mono text-sm"
        />
        <Button onClick={() => run()} disabled={loading}>
          {loading ? "…" : "Run"}
        </Button>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            onClick={() => {
              setQ(ex);
              run(ex);
            }}
          >
            {ex}
          </button>
        ))}
      </div>

      {result && (
        <div className="mt-6 overflow-auto rounded-lg border border-slate-200 dark:border-slate-800">
          {result.type === "error" && (
            <p className="p-4 text-sm text-red-600 whitespace-pre-wrap">{result.message}</p>
          )}
          {result.type === "count" && (
            <p className="p-6 text-3xl font-bold">
              {result.count}{" "}
              <span className="text-base font-normal text-slate-400">{result.entity}</span>
            </p>
          )}
          {(result.type === "list" || result.type === "table") && (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  {(result.columns ?? []).map((c: string) => (
                    <th key={c} className="px-3 py-2 font-medium">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(result.rows ?? []).map((row: any, i: number) => (
                  <tr key={i}>
                    {(result.columns ?? []).map((c: string) => (
                      <td key={c} className="max-w-[200px] truncate px-3 py-1.5">
                        {formatCell(row[c])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function formatCell(v: unknown) {
  if (v == null) return "—";
  if (typeof v === "object") return JSON.stringify(v).slice(0, 80);
  return String(v).slice(0, 80);
}
