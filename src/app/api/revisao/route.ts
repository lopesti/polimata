import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { perguntas, revisoes, sessoes } from "@/lib/db/schema";
import { eq, sql, count } from "drizzle-orm";
import { z } from "zod";
import { reviewCard, previewIntervals } from "@/lib/fsrs/scheduler";

export const dynamic = "force-dynamic";

const reviewSchema = z.object({
  perguntaId: z.string().uuid(),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  duracaoMs: z.number().int().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const [card] = db
      .select()
      .from(perguntas)
      .where(eq(perguntas.id, parsed.data.perguntaId))
      .all();

    if (!card) {
      return NextResponse.json({ error: "Pergunta não encontrada" }, { status: 404 });
    }

    const result = reviewCard(
      {
        dificuldade: card.dificuldade ?? 0,
        estabilidade: card.estabilidade ?? 0,
        facilidade: card.facilidade ?? 2.5,
        repeticoes: card.repeticoes ?? 0,
        lapsos: card.lapsos ?? 0,
        estado: (card.estado as "novo" | "aprendendo" | "revisao" | "reaprendendo") ?? "novo",
        proximaRevisao: card.proximaRevisao,
        ultimaRevisao: card.ultimaRevisao,
      },
      parsed.data.rating
    );

    const [updated] = db
      .update(perguntas)
      .set({
        dificuldade: result.dificuldade,
        estabilidade: result.estabilidade,
        facilidade: result.facilidade,
        repeticoes: result.repeticoes,
        lapsos: result.lapsos,
        estado: result.estado,
        proximaRevisao: result.proximaRevisao,
        ultimaRevisao: result.ultimaRevisao,
      })
      .where(eq(perguntas.id, card.id))
      .returning()
      .all();

    db.insert(revisoes)
      .values({
        perguntaId: card.id,
        rating: parsed.data.rating,
        duracaoMs: parsed.data.duracaoMs ?? null,
      })
      .run();

    // Light session tracking
    db.insert(sessoes)
      .values({
        data: new Date(),
        duracao: parsed.data.duracaoMs ? Math.ceil(parsed.data.duracaoMs / 60_000) : 1,
        acertos: parsed.data.rating >= 3 ? 1 : 0,
        erros: parsed.data.rating < 3 ? 1 : 0,
        metadados: { tipo: "fsrs", perguntaId: card.id, rating: parsed.data.rating },
      })
      .run();

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[POST /api/revisao]", error);
    return NextResponse.json({ error: "Falha na revisão" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const previewId = req.nextUrl.searchParams.get("preview");
  if (previewId) {
    const [card] = db
      .select()
      .from(perguntas)
      .where(eq(perguntas.id, previewId))
      .all();
    if (!card) {
      return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
    }
    const intervals = previewIntervals({
      dificuldade: card.dificuldade ?? 0,
      estabilidade: card.estabilidade ?? 0,
      facilidade: card.facilidade ?? 2.5,
      repeticoes: card.repeticoes ?? 0,
      lapsos: card.lapsos ?? 0,
      estado: (card.estado as "novo") ?? "novo",
      proximaRevisao: card.proximaRevisao,
      ultimaRevisao: card.ultimaRevisao,
    });
    return NextResponse.json({ data: intervals });
  }

  // Stats
  try {
    const all = db.select().from(perguntas).all();
    const byEstado = {
      novo: 0,
      aprendendo: 0,
      revisao: 0,
      reaprendendo: 0,
    };
    for (const p of all) {
      const e = (p.estado ?? "novo") as keyof typeof byEstado;
      if (e in byEstado) byEstado[e]++;
    }

    const now = new Date();
    const due = all.filter(
      (p) =>
        p.estado === "novo" ||
        !p.proximaRevisao ||
        p.proximaRevisao <= now
    ).length;

    const revCount = db.select({ value: count() }).from(revisoes).all()[0]?.value ?? 0;

    return NextResponse.json({
      data: {
        total: all.length,
        due,
        byEstado,
        revisoesRegistradas: revCount,
      },
    });
  } catch (error) {
    console.error("[GET /api/revisao stats]", error);
    return NextResponse.json({ error: "Falha nas stats" }, { status: 500 });
  }
}
