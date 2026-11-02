"use client";

import { useEffect, useState } from "react";
import { LoadSimulator } from "@/components/revisao/load-simulator";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Stats = {
  totalCards: number;
  dueToday: number;
  byEstado: Record<string, number>;
  retencaoPct: number | null;
  totalRevisoes: number;
  avgDuracaoMs: number | null;
  ratingDist: Record<string, number>;
  reviewsPerDay: { date: string; count: number }[];
  forecast30: { date: string; count: number }[];
  peakForecast: number;
  avgStability: number | null;
  avgDifficulty: number | null;
  totalLapsos: number;
  matureCount: number;
  heatmap: { date: string; count: number }[];
  overload: {
    level: string;
    message: string;
    peak7: number;
    avg7: number;
  } | null;
  scatter: {
    id: string;
    x: number;
    y: number;
    reps: number;
    lapsos: number;
    estado: string;
    label: string;
  }[];
  recent: {
    id: string;
    rating: number;
    duracaoMs: number | null;
    revisadoEm: string | Date | null;
    frente: string;
    tipo: string;
  }[];
};

const ratingLabel: Record<number, string> = {
  1: "Again",
  2: "Hard",
  3: "Good",
  4: "Easy",
};

const ratingColor: Record<number, string> = {
  1: "bg-red-500",
  2: "bg-orange-500",
  3: "bg-emerald-500",
  4: "bg-sky-500",
};

export function StatsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/revisao/stats")
      .then((r) => r.json())
      .then((j) => {
        if (j.error) setError(j.error);
        else setStats(j.data);
      })
      .catch(() => setError("Falha ao carregar"));
  }, []);

  if (error) {
    return <p className="p-8 text-red-600">{error}</p>;
  }
  if (!stats) {
    return <p className="p-8 text-slate-400">Carregando estatísticas…</p>;
  }

  const maxDay = Math.max(1, ...stats.reviewsPerDay.map((d) => d.count));
  const maxFc = Math.max(1, stats.peakForecast);

  return (
    <div className="space-y-10">
      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Due hoje", value: stats.dueToday, hint: "para revisar" },
          { label: "Total cards", value: stats.totalCards, hint: `${stats.matureCount} maduros` },
          {
            label: "Retenção",
            value: stats.retencaoPct != null ? `${stats.retencaoPct}%` : "—",
            hint: "Good+Easy / total",
          },
          {
            label: "Revisões",
            value: stats.totalRevisoes,
            hint:
              stats.avgDuracaoMs != null
                ? `média ${Math.round(stats.avgDuracaoMs / 1000)}s`
                : "registradas",
          },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
          >
            <p className="text-xs uppercase tracking-wide text-slate-400">
              {k.label}
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums">{k.value}</p>
            <p className="mt-1 text-xs text-slate-400">{k.hint}</p>
          </div>
        ))}
      </div>

      {stats.overload && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            stats.overload.level === "alto"
              ? "border-red-300 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100"
              : "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100"
          }`}
        >
          <strong>Carga {stats.overload.level}</strong> — {stats.overload.message}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Link href="/revisao">
          <Button>Iniciar revisão ({stats.dueToday})</Button>
        </Link>
        <Badge variant="secondary">lapsos {stats.totalLapsos}</Badge>
        {stats.avgStability != null && (
          <Badge variant="outline">estabilidade média {stats.avgStability}</Badge>
        )}
        {stats.avgDifficulty != null && (
          <Badge variant="outline">dificuldade média {stats.avgDifficulty}</Badge>
        )}
      </div>

      {/* Estados */}
      <section>
        <h2 className="text-sm font-semibold uppercase text-slate-400">
          Cards por estado
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Object.entries(stats.byEstado).map(([k, v]) => (
            <div
              key={k}
              className="rounded-lg bg-slate-50 px-3 py-3 text-center dark:bg-slate-900"
            >
              <p className="text-2xl font-bold tabular-nums">{v}</p>
              <p className="text-xs capitalize text-slate-500">{k}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rating distribution */}
      <section>
        <h2 className="text-sm font-semibold uppercase text-slate-400">
          Distribuição de ratings
        </h2>
        <div className="mt-3 flex items-end gap-3 h-28">
          {([1, 2, 3, 4] as const).map((r) => {
            const n = stats.ratingDist[String(r)] ?? 0;
            const total = Object.values(stats.ratingDist).reduce((a, b) => a + b, 0) || 1;
            const h = Math.max(4, (n / total) * 100);
            return (
              <div key={r} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs tabular-nums text-slate-500">{n}</span>
                <div
                  className={cn("w-full rounded-t", ratingColor[r])}
                  style={{ height: `${h}%` }}
                />
                <span className="text-[10px] text-slate-400">
                  {r} {ratingLabel[r]}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Reviews last 14 days */}
      <section>
        <h2 className="text-sm font-semibold uppercase text-slate-400">
          Revisões · 14 dias
        </h2>
        <div className="mt-3 flex items-end gap-1 h-24">
          {stats.reviewsPerDay.map((d) => (
            <div
              key={d.date}
              className="group relative flex flex-1 flex-col items-center justify-end"
              title={`${d.date}: ${d.count}`}
            >
              <div
                className="w-full rounded-t bg-slate-800 dark:bg-slate-200"
                style={{
                  height: `${Math.max(2, (d.count / maxDay) * 100)}%`,
                }}
              />
              <span className="mt-1 text-[9px] text-slate-400 rotate-0">
                {d.date.slice(8)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Forecast 30 days */}
      <section>
        <h2 className="text-sm font-semibold uppercase text-slate-400">
          Previsão de carga · 30 dias
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Pico: {stats.peakForecast} cards/dia
        </p>
        <div className="mt-3 flex items-end gap-0.5 h-20 overflow-x-auto">
          {stats.forecast30.map((d, i) => (
            <div
              key={d.date}
              className="flex min-w-[8px] flex-1 flex-col items-center justify-end"
              title={`${d.date}: ${d.count}`}
            >
              <div
                className={cn(
                  "w-full rounded-sm",
                  i === 0 ? "bg-emerald-600" : "bg-slate-400 dark:bg-slate-600"
                )}
                style={{
                  height: `${Math.max(2, (d.count / maxFc) * 100)}%`,
                }}
              />
            </div>
          ))}
        </div>
      </section>

      
      
      <LoadSimulator />

      {/* Heatmap 12 weeks */}
      <section>
        <h2 className="text-sm font-semibold uppercase text-slate-400">
          Heatmap · 12 semanas
        </h2>
        <div className="mt-3 flex flex-wrap gap-0.5">
          {stats.heatmap.map((d) => {
            const intensity =
              d.count === 0
                ? "bg-slate-100 dark:bg-slate-900"
                : d.count < 3
                  ? "bg-emerald-200 dark:bg-emerald-900"
                  : d.count < 8
                    ? "bg-emerald-400 dark:bg-emerald-700"
                    : "bg-emerald-600 dark:bg-emerald-500";
            return (
              <div
                key={d.date}
                title={`${d.date}: ${d.count} revisões`}
                className={`h-3 w-3 rounded-sm ${intensity}`}
              />
            );
          })}
        </div>
        <p className="mt-2 text-[10px] text-slate-400">
          Cada quadrado = 1 dia · tom = volume de revisões
        </p>
      </section>

      {/* Scatter difficulty × stability */}
      <section>
        <h2 className="text-sm font-semibold uppercase text-slate-400">
          Dispersão · dificuldade × estabilidade
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Cada ponto é um card já visto pelo FSRS. X = dificuldade · Y = estabilidade
        </p>
        {stats.scatter.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">
            Revise alguns cards para popular o gráfico.
          </p>
        ) : (
          <ScatterPlot points={stats.scatter} />
        )}
      </section>

      {/* Recent */}
      <section>
        <h2 className="text-sm font-semibold uppercase text-slate-400">
          Revisões recentes
        </h2>
        {stats.recent.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">
            Nenhuma revisão ainda. Vá em Revisão e avalie alguns cards.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {stats.recent.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate">{r.frente}</p>
                  <p className="text-[10px] text-slate-400">
                    {r.tipo}
                    {r.revisadoEm
                      ? ` · ${new Date(r.revisadoEm).toLocaleString("pt-BR")}`
                      : ""}
                    {r.duracaoMs != null
                      ? ` · ${Math.round(r.duracaoMs / 1000)}s`
                      : ""}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded px-2 py-0.5 text-xs text-white",
                    ratingColor[r.rating] ?? "bg-slate-500"
                  )}
                >
                  {ratingLabel[r.rating] ?? r.rating}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

const estadoColor: Record<string, string> = {
  novo: "#94a3b8",
  aprendendo: "#f59e0b",
  revisao: "#10b981",
  reaprendendo: "#ef4444",
};

function ScatterPlot({
  points,
}: {
  points: {
    id: string;
    x: number;
    y: number;
    reps: number;
    lapsos: number;
    estado: string;
    label: string;
  }[];
}) {
  const W = 640;
  const H = 320;
  const pad = { t: 20, r: 20, b: 40, l: 48 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = 0;
  const maxX = Math.max(10, ...xs, 1);
  const minY = 0;
  const maxY = Math.max(1, ...ys, 0.1);

  const sx = (x: number) => pad.l + ((x - minX) / (maxX - minX || 1)) * innerW;
  const sy = (y: number) => pad.t + innerH - ((y - minY) / (maxY - minY || 1)) * innerH;

  // grid ticks
  const xTicks = 5;
  const yTicks = 4;

  return (
    <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[320px]">
        {/* grid */}
        {Array.from({ length: xTicks + 1 }, (_, i) => {
          const v = minX + ((maxX - minX) * i) / xTicks;
          const x = sx(v);
          return (
            <g key={`x${i}`}>
              <line
                x1={x}
                y1={pad.t}
                x2={x}
                y2={pad.t + innerH}
                stroke="#e2e8f0"
                strokeWidth={1}
              />
              <text
                x={x}
                y={H - 12}
                textAnchor="middle"
                fontSize={10}
                fill="#94a3b8"
              >
                {v.toFixed(1)}
              </text>
            </g>
          );
        })}
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const v = minY + ((maxY - minY) * i) / yTicks;
          const y = sy(v);
          return (
            <g key={`y${i}`}>
              <line
                x1={pad.l}
                y1={y}
                x2={pad.l + innerW}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth={1}
              />
              <text
                x={pad.l - 8}
                y={y + 3}
                textAnchor="end"
                fontSize={10}
                fill="#94a3b8"
              >
                {v.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* axes labels */}
        <text
          x={pad.l + innerW / 2}
          y={H - 2}
          textAnchor="middle"
          fontSize={11}
          fill="#64748b"
        >
          Dificuldade →
        </text>
        <text
          x={14}
          y={pad.t + innerH / 2}
          textAnchor="middle"
          fontSize={11}
          fill="#64748b"
          transform={`rotate(-90 14 ${pad.t + innerH / 2})`}
        >
          Estabilidade →
        </text>

        {/* points */}
        {points.map((p) => {
          const r = 4 + Math.min(8, p.reps);
          return (
            <circle
              key={p.id}
              cx={sx(p.x)}
              cy={sy(p.y)}
              r={r}
              fill={estadoColor[p.estado] ?? "#64748b"}
              fillOpacity={0.75}
              stroke="#fff"
              strokeWidth={1}
            >
              <title>
                {`${p.label}\nD=${p.x.toFixed(2)} S=${p.y.toFixed(2)}\nreps=${p.reps} lapsos=${p.lapsos} (${p.estado})`}
              </title>
            </circle>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-3 border-t border-slate-100 px-3 py-2 text-[10px] dark:border-slate-800">
        {Object.entries(estadoColor).map(([k, c]) => (
          <span key={k} className="flex items-center gap-1 text-slate-500">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: c }}
            />
            {k}
          </span>
        ))}
        <span className="text-slate-400">tamanho ∝ repetições</span>
      </div>
    </div>
  );
}

