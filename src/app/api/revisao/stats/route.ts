import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { perguntas, revisoes } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cards = db.select().from(perguntas).all();
    const logs = db
      .select()
      .from(revisoes)
      .orderBy(desc(revisoes.revisadoEm))
      .limit(500)
      .all();

    const now = new Date();
    const byEstado = {
      novo: 0,
      aprendendo: 0,
      revisao: 0,
      reaprendendo: 0,
    };
    for (const c of cards) {
      const e = (c.estado ?? "novo") as keyof typeof byEstado;
      if (e in byEstado) byEstado[e]++;
    }

    const due = cards.filter(
      (p) =>
        p.estado === "novo" ||
        !p.proximaRevisao ||
        p.proximaRevisao <= now
    );

    // Retention proxy: % of ratings that were Good or Easy (3 or 4)
    const rated = logs.filter((l) => l.rating != null);
    const good = rated.filter((l) => (l.rating ?? 0) >= 3).length;
    const retencao =
      rated.length > 0 ? Math.round((good / rated.length) * 1000) / 10 : null;

    // Average duration
    const withDur = logs.filter((l) => l.duracaoMs != null && l.duracaoMs > 0);
    const avgMs =
      withDur.length > 0
        ? Math.round(
            withDur.reduce((a, l) => a + (l.duracaoMs ?? 0), 0) / withDur.length
          )
        : null;

    // Rating distribution
    const ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const l of logs) {
      const r = l.rating as 1 | 2 | 3 | 4;
      if (r >= 1 && r <= 4) ratingDist[r]++;
    }

    // Reviews per day (last 14 days)
    const dayMap = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      dayMap.set(d.toISOString().slice(0, 10), 0);
    }
    for (const l of logs) {
      if (!l.revisadoEm) continue;
      const key = new Date(l.revisadoEm).toISOString().slice(0, 10);
      if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) ?? 0) + 1);
    }
    const reviewsPerDay = Array.from(dayMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    // 30-day forecast
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const forecast: { date: string; count: number }[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const count = cards.filter((p) => {
        if (i === 0 && (p.estado === "novo" || !p.proximaRevisao)) return true;
        if (!p.proximaRevisao) return false;
        const dueAt = new Date(p.proximaRevisao);
        return dueAt >= d && dueAt < next;
      }).length;
      forecast.push({ date: d.toISOString().slice(0, 10), count });
    }

    // Stability / difficulty averages (mature cards)
    const mature = cards.filter((c) => (c.repeticoes ?? 0) > 0);
    const avgStability =
      mature.length > 0
        ? Math.round(
            (mature.reduce((a, c) => a + (c.estabilidade ?? 0), 0) /
              mature.length) *
              100
          ) / 100
        : null;
    const avgDifficulty =
      mature.length > 0
        ? Math.round(
            (mature.reduce((a, c) => a + (c.dificuldade ?? 0), 0) /
              mature.length) *
              100
          ) / 100
        : null;

    // Recent reviews detail
    const recent = logs.slice(0, 20).map((l) => {
      const card = cards.find((c) => c.id === l.perguntaId);
      return {
        id: l.id,
        rating: l.rating,
        duracaoMs: l.duracaoMs,
        revisadoEm: l.revisadoEm,
        frente: card?.frente?.slice(0, 80) ?? "—",
        tipo: card?.tipo ?? "—",
      };
    });

    // Lapses
    const totalLapsos = cards.reduce((a, c) => a + (c.lapsos ?? 0), 0);

    // Heatmap: last 12 weeks (84 days)
    const heat: { date: string; count: number }[] = [];
    for (let i = 83; i >= 0; i--) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const count = logs.filter((l) => {
        if (!l.revisadoEm) return false;
        const t = new Date(l.revisadoEm);
        return t >= d && t < next;
      }).length;
      heat.push({ date: key, count });
    }

    // Overload: peak next 7 days vs avg
    const next7 = forecast.slice(0, 7);
    const peak7 = Math.max(0, ...next7.map((f) => f.count));
    const avg7 =
      next7.reduce((a, f) => a + f.count, 0) / Math.max(1, next7.length);
    const overload =
      peak7 >= 40 || peak7 > avg7 * 2.5
        ? {
            level: peak7 >= 80 ? "alto" : "moderado",
            message:
              peak7 >= 80
                ? `Carga alta: pico de ${peak7} cards em 7 dias. Considere reduzir cards novos.`
                : `Carga elevada: pico ${peak7} (média ${avg7.toFixed(0)}). Monitore a fila.`,
            peak7,
            avg7: Math.round(avg7 * 10) / 10,
          }
        : null;


    // Scatter: difficulty (x) vs stability (y)
    const scatter = cards
      .filter((c) => (c.repeticoes ?? 0) > 0 || (c.estabilidade ?? 0) > 0 || (c.dificuldade ?? 0) > 0)
      .map((c) => ({
        id: c.id,
        x: Number(c.dificuldade ?? 0),
        y: Number(c.estabilidade ?? 0),
        reps: c.repeticoes ?? 0,
        lapsos: c.lapsos ?? 0,
        estado: c.estado ?? "novo",
        label: (c.frente ?? "").slice(0, 50),
      }));


    return NextResponse.json({
      data: {
        totalCards: cards.length,
        dueToday: due.length,
        byEstado,
        retencaoPct: retencao,
        totalRevisoes: logs.length,
        avgDuracaoMs: avgMs,
        ratingDist,
        reviewsPerDay,
        forecast30: forecast,
        peakForecast: Math.max(0, ...forecast.map((f) => f.count)),
        avgStability,
        avgDifficulty,
        totalLapsos,
        recent,
        matureCount: mature.length,
        heatmap: heat,
        overload,
        scatter,
      },
    });
  } catch (error) {
    console.error("[revisao/stats]", error);
    return NextResponse.json({ error: "Falha nas estatísticas" }, { status: 500 });
  }
}
