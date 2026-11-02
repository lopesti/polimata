import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { notas, blocos } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  titulo: z.string().max(500).optional().nullable(),
  tipo: z.enum(["factual", "conceitual", "procedural", "abstrato"]).optional(),
  status: z
    .enum([
      "capturado",
      "triado",
      "processado",
      "testado",
      "revisado",
      "aplicado",
      "dominado",
    ])
    .optional(),
  fonteId: z.string().uuid().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const [nota] = db.select().from(notas).where(eq(notas.id, params.id)).all();
    if (!nota) {
      return NextResponse.json({ error: "Nota não encontrada" }, { status: 404 });
    }
    const blocosNota = db
      .select()
      .from(blocos)
      .where(eq(blocos.notaId, params.id))
      .orderBy(asc(blocos.ordem))
      .all();
    return NextResponse.json({ data: { ...nota, blocos: blocosNota } });
  } catch (error) {
    console.error("[GET /api/notas/:id]", error);
    return NextResponse.json({ error: "Falha ao buscar nota" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const [updated] = db
      .update(notas)
      .set({ ...parsed.data, atualizadoEm: new Date() })
      .where(eq(notas.id, params.id))
      .returning()
      .all();

    if (!updated) {
      return NextResponse.json({ error: "Nota não encontrada" }, { status: 404 });
    }
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[PATCH /api/notas/:id]", error);
    return NextResponse.json({ error: "Falha ao atualizar nota" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const [deleted] = db
      .delete(notas)
      .where(eq(notas.id, params.id))
      .returning()
      .all();
    if (!deleted) {
      return NextResponse.json({ error: "Nota não encontrada" }, { status: 404 });
    }
    return NextResponse.json({ data: deleted });
  } catch (error) {
    console.error("[DELETE /api/notas/:id]", error);
    return NextResponse.json({ error: "Falha ao deletar nota" }, { status: 500 });
  }
}
