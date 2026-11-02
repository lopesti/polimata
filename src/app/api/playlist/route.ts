import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { notas, blocos, perguntas } from "@/lib/db/schema";
import { eq, asc, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

/** Build audio playlist from recent notes + due cards (text only for TTS) */
export async function GET() {
  try {
    const recentNotas = db.select().from(notas).orderBy(desc(notas.atualizadoEm)).limit(15).all();
    const items: {
      id: string;
      tipo: "nota" | "pergunta";
      titulo: string;
      texto: string;
    }[] = [];

    for (const n of recentNotas) {
      const bs = db
        .select()
        .from(blocos)
        .where(eq(blocos.notaId, n.id))
        .orderBy(asc(blocos.ordem))
        .all();
      const texto = bs
        .map((b) => b.conteudo.replace(/<[^>]+>/g, " "))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      if (texto.length > 20) {
        items.push({
          id: n.id,
          tipo: "nota",
          titulo: n.titulo || "Nota",
          texto: `${n.titulo || ""}. ${texto}`.slice(0, 2000),
        });
      }
    }

    const now = new Date();
    const cards = db.select().from(perguntas).all().filter(
      (p) => p.estado === "novo" || !p.proximaRevisao || p.proximaRevisao <= now
    );
    for (const c of cards.slice(0, 10)) {
      items.push({
        id: c.id,
        tipo: "pergunta",
        titulo: c.frente.slice(0, 60),
        texto: `Pergunta: ${c.frente.replace(/\{\{c\d+::([^}]+)\}\}/g, "$1")}. Resposta: ${c.verso}`.slice(0, 1500),
      });
    }

    return NextResponse.json({ data: items });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Falha" }, { status: 500 });
  }
}
