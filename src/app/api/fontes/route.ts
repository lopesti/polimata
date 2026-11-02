import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { fontes } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  titulo: z.string().min(1).max(500),
  autor: z.string().max(300).optional().nullable(),
  tipo: z.enum(["artigo", "livro", "video", "pdf", "podcast", "web", "outro"]),
  url: z.string().url().optional().nullable().or(z.literal("")),
  tema: z.string().max(200).optional().nullable(),
  status: z
    .enum(["capturado", "triado", "processado", "testado", "dominado"])
    .optional(),
  conteudoBruto: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const rows = db.select().from(fontes).orderBy(desc(fontes.criadoEm)).all();
    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error("[GET /api/fontes]", error);
    return NextResponse.json(
      { error: "Falha ao listar fontes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const values = {
      ...parsed.data,
      url: parsed.data.url || null,
      autor: parsed.data.autor || null,
      tema: parsed.data.tema || null,
      conteudoBruto: parsed.data.conteudoBruto || null,
    };

    const [created] = db.insert(fontes).values(values).returning().all();
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/fontes]", error);
    return NextResponse.json(
      { error: "Falha ao criar fonte" },
      { status: 500 }
    );
  }
}
