import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { perguntas } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const [deleted] = db
      .delete(perguntas)
      .where(eq(perguntas.id, params.id))
      .returning()
      .all();
    if (!deleted) {
      return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
    }
    return NextResponse.json({ data: deleted });
  } catch (error) {
    return NextResponse.json({ error: "Falha ao deletar" }, { status: 500 });
  }
}
