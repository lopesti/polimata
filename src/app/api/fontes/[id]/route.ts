import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { fontes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  titulo: z.string().min(1).max(500).optional(),
  autor: z.string().max(300).optional().nullable(),
  tipo: z
    .enum(["artigo", "livro", "video", "pdf", "podcast", "web", "outro"])
    .optional(),
  url: z.string().url().optional().nullable().or(z.literal("")),
  tema: z.string().max(200).optional().nullable(),
  status: z
    .enum(["capturado", "triado", "processado", "testado", "dominado"])
    .optional(),
  conteudoBruto: z.string().optional().nullable(),
});

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const [row] = db
      .select()
      .from(fontes)
      .where(eq(fontes.id, params.id))
      .all();
    if (!row) {
      return NextResponse.json({ error: "Fonte não encontrada" }, { status: 404 });
    }
    return NextResponse.json({ data: row });
  } catch (error) {
    console.error("[GET /api/fontes/:id]", error);
    return NextResponse.json({ error: "Falha ao buscar fonte" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const values = {
      ...parsed.data,
      url: parsed.data.url === "" ? null : parsed.data.url,
      atualizadoEm: new Date(),
    };

    const [updated] = db
      .update(fontes)
      .set(values)
      .where(eq(fontes.id, params.id))
      .returning()
      .all();

    if (!updated) {
      return NextResponse.json({ error: "Fonte não encontrada" }, { status: 404 });
    }
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[PATCH /api/fontes/:id]", error);
    return NextResponse.json({ error: "Falha ao atualizar fonte" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const [deleted] = db
      .delete(fontes)
      .where(eq(fontes.id, params.id))
      .returning()
      .all();
    if (!deleted) {
      return NextResponse.json({ error: "Fonte não encontrada" }, { status: 404 });
    }
    return NextResponse.json({ data: deleted });
  } catch (error) {
    console.error("[DELETE /api/fontes/:id]", error);
    return NextResponse.json({ error: "Falha ao deletar fonte" }, { status: 500 });
  }
}
