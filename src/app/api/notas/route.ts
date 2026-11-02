import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { notas, blocos } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  titulo: z.string().max(500).optional().nullable(),
  tipo: z.enum(["factual", "conceitual", "procedural", "abstrato"]),
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
  conteudoInicial: z.string().optional(),
});

export async function GET() {
  try {
    const rows = db.select().from(notas).orderBy(desc(notas.criadoEm)).all();
    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error("[GET /api/notas]", error);
    return NextResponse.json({ error: "Falha ao listar notas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { conteudoInicial, ...rest } = parsed.data;

    const [created] = db
      .insert(notas)
      .values({
        titulo: rest.titulo || null,
        tipo: rest.tipo,
        status: rest.status ?? "capturado",
        fonteId: rest.fonteId || null,
        tags: rest.tags ?? [],
      })
      .returning()
      .all();

    if (conteudoInicial && created) {
      db.insert(blocos)
        .values({
          notaId: created.id,
          tipo: "paragrafo",
          conteudo: conteudoInicial,
          ordem: 0,
        })
        .run();
    }

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/notas]", error);
    return NextResponse.json({ error: "Falha ao criar nota" }, { status: 500 });
  }
}
