import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { sessoes, metodos } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { atualizarEficacia } from "@/lib/motor/regras";

export const dynamic = "force-dynamic";

const schema = z.object({
  stackId: z.string().uuid().optional().nullable(),
  metodoId: z.string().uuid().optional().nullable(),
  duracao: z.number().int().positive().optional(),
  dificuldade: z.number().int().min(1).max(5).optional(),
  acertos: z.number().int().min(0).optional(),
  erros: z.number().int().min(0).optional(),
  ajuste: z.string().optional(),
});

export async function GET() {
  try {
    const rows = db.select().from(sessoes).orderBy(desc(sessoes.data)).limit(50).all();
    return NextResponse.json({ data: rows });
  } catch (error) {
    return NextResponse.json({ error: "Falha" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const [created] = db
      .insert(sessoes)
      .values({
        stackId: parsed.data.stackId || null,
        metodoId: parsed.data.metodoId || null,
        duracao: parsed.data.duracao ?? null,
        dificuldade: parsed.data.dificuldade ?? null,
        acertos: parsed.data.acertos ?? null,
        erros: parsed.data.erros ?? null,
        ajuste: parsed.data.ajuste ?? null,
      })
      .returning()
      .all();

    // Update eficacia pessoal do método
    if (parsed.data.metodoId && (parsed.data.acertos != null || parsed.data.erros != null)) {
      const [m] = db
        .select()
        .from(metodos)
        .where(eq(metodos.id, parsed.data.metodoId))
        .all();
      if (m) {
        const nova = atualizarEficacia(
          m.eficaciaPessoal ?? 3,
          parsed.data.acertos ?? 0,
          parsed.data.erros ?? 0,
          parsed.data.dificuldade ?? 3
        );
        db.update(metodos)
          .set({ eficaciaPessoal: nova })
          .where(eq(metodos.id, m.id))
          .run();
      }
    }

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/sessoes]", error);
    return NextResponse.json({ error: "Falha ao registrar sessão" }, { status: 500 });
  }
}
