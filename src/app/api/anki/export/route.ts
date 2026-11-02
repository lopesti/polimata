import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { perguntas } from "@/lib/db/schema";
import { perguntasToAnkiTsv } from "@/lib/anki/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = db.select().from(perguntas).all();
    const tsv = perguntasToAnkiTsv(
      rows.map((r) => ({
        frente: r.frente,
        verso: r.verso,
        tipo: r.tipo,
      }))
    );
    return new NextResponse(tsv, {
      status: 200,
      headers: {
        "Content-Type": "text/tab-separated-values; charset=utf-8",
        "Content-Disposition": `attachment; filename="polimata-anki-${Date.now()}.txt"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
