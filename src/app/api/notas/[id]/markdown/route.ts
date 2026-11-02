import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { notas, blocos } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { notaToMarkdown } from "@/lib/markdown/export";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const [nota] = db.select().from(notas).where(eq(notas.id, params.id)).all();
    if (!nota) {
      return NextResponse.json({ error: "Nota não encontrada" }, { status: 404 });
    }
    const bs = db
      .select()
      .from(blocos)
      .where(eq(blocos.notaId, params.id))
      .orderBy(asc(blocos.ordem))
      .all();

    const md = notaToMarkdown(
      nota.titulo,
      bs.map((b) => b.conteudo)
    );

    const filename = `${(nota.titulo || "nota").replace(/[^\w\-]+/g, "_")}.md`;
    return new NextResponse(md, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[GET markdown]", error);
    return NextResponse.json({ error: "Falha no export" }, { status: 500 });
  }
}
