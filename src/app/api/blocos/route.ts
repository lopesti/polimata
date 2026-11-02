import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { blocos, notas } from "@/lib/db/schema";
import { eq, asc, max } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const saveSchema = z.object({
  notaId: z.string().uuid(),
  blocos: z.array(
    z.object({
      id: z.string().uuid().optional(),
      tipo: z.enum([
        "paragrafo",
        "heading",
        "callout",
        "codigo",
        "imagem",
        "toggle",
        "lista",
        "tabela",
      ]),
      conteudo: z.string(),
      ordem: z.number().int().min(0),
      metadados: z.unknown().optional(),
    })
  ),
});

/** Replace all blocks of a note (autosave pattern) */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = saveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { notaId, blocos: incoming } = parsed.data;

    const [nota] = db.select().from(notas).where(eq(notas.id, notaId)).all();
    if (!nota) {
      return NextResponse.json({ error: "Nota não encontrada" }, { status: 404 });
    }

    // Simple replace strategy for MVP
    db.delete(blocos).where(eq(blocos.notaId, notaId)).run();

    if (incoming.length > 0) {
      db.insert(blocos)
        .values(
          incoming.map((b) => ({
            id: b.id,
            notaId,
            tipo: b.tipo,
            conteudo: b.conteudo,
            ordem: b.ordem,
            metadados: b.metadados ?? null,
          }))
        )
        .run();
    }

    db.update(notas)
      .set({ atualizadoEm: new Date() })
      .where(eq(notas.id, notaId))
      .run();

    const saved = db
      .select()
      .from(blocos)
      .where(eq(blocos.notaId, notaId))
      .orderBy(asc(blocos.ordem))
      .all();

    return NextResponse.json({ data: saved });
  } catch (error) {
    console.error("[PUT /api/blocos]", error);
    return NextResponse.json({ error: "Falha ao salvar blocos" }, { status: 500 });
  }
}
