import { NextRequest } from "next/server";
import { db } from "@/lib/db/client";
import { notas, blocos, links } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { extractWikiTitles, normalizeTitle } from "@/lib/links/wiki";
import { ok, fail } from "@/lib/api/http";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const notaId = req.nextUrl.searchParams.get("notaId");
    if (!notaId) return fail("notaId obrigatório");

    const [nota] = db.select().from(notas).where(eq(notas.id, notaId)).all();
    if (!nota) return fail("Nota não encontrada", 404);

    const bs = db.select().from(blocos).where(eq(blocos.notaId, notaId)).all();
    const text = bs.map((b) => b.conteudo).join("\n");
    const outboundTitles = extractWikiTitles(text);

    const allNotas = db.select().from(notas).all();
    const byTitle = new Map(
      allNotas
        .filter((n) => n.titulo)
        .map((n) => [normalizeTitle(n.titulo!), n])
    );

    const outbound = outboundTitles.map((t) => {
      const target = byTitle.get(normalizeTitle(t));
      return {
        title: t,
        notaId: target?.id ?? null,
        resolved: Boolean(target),
      };
    });

    const myTitle = nota.titulo ? normalizeTitle(nota.titulo) : "";
    const inbound: { id: string; titulo: string | null }[] = [];
    if (myTitle) {
      for (const n of allNotas) {
        if (n.id === notaId) continue;
        const blocks = db.select().from(blocos).where(eq(blocos.notaId, n.id)).all();
        const blob = blocks.map((b) => b.conteudo).join("\n");
        const titles = extractWikiTitles(blob).map(normalizeTitle);
        if (titles.includes(myTitle)) {
          inbound.push({ id: n.id, titulo: n.titulo });
        }
      }
    }

    const edgeIn = db.select().from(links).where(eq(links.destinoId, notaId)).all();
    for (const e of edgeIn) {
      if (!inbound.some((i) => i.id === e.origemId)) {
        const [n] = db.select().from(notas).where(eq(notas.id, e.origemId)).all();
        if (n) inbound.push({ id: n.id, titulo: n.titulo });
      }
    }

    return ok({
      outbound,
      inbound,
      unresolved: outbound.filter((o) => !o.resolved).map((o) => o.title),
    });
  } catch (error) {
    console.error("[backlinks GET]", error);
    return fail("Falha ao calcular backlinks", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const notaId = body.notaId as string;
    if (!notaId) return fail("notaId obrigatório");

    const [nota] = db.select().from(notas).where(eq(notas.id, notaId)).all();
    if (!nota) return fail("Nota não encontrada", 404);

    const bs = db.select().from(blocos).where(eq(blocos.notaId, notaId)).all();
    const text = bs.map((b) => b.conteudo).join("\n");
    const titles = extractWikiTitles(text);

    const allNotas = db.select().from(notas).all();
    const byTitle = new Map(
      allNotas.filter((n) => n.titulo).map((n) => [normalizeTitle(n.titulo!), n])
    );

    db.delete(links).where(eq(links.origemId, notaId)).run();

    let created = 0;
    for (const t of titles) {
      const target = byTitle.get(normalizeTitle(t));
      if (!target || target.id === notaId) continue;
      db.insert(links)
        .values({ origemId: notaId, destinoId: target.id, tipoLink: "wiki" })
        .run();
      created++;
    }

    return ok({ created, titles: titles.length });
  } catch (error) {
    console.error("[backlinks POST]", error);
    return fail("Falha ao sincronizar links", 500);
  }
}
