import { NextRequest, NextResponse } from "next/server";
import { BUILTIN_TEMPLATES, renderTemplate } from "@/lib/templates/engine";
import { db } from "@/lib/db/client";
import { notas, blocos } from "@/lib/db/schema";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ data: BUILTIN_TEMPLATES });
}

const applySchema = z.object({
  templateId: z.string(),
  title: z.string().optional(),
  fonte: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = applySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const tpl = BUILTIN_TEMPLATES.find((t) => t.id === parsed.data.templateId);
    if (!tpl) {
      return NextResponse.json({ error: "Template não encontrado" }, { status: 404 });
    }
    const now = new Date();
    const md = renderTemplate(tpl.body, {
      title: parsed.data.title || "Sem título",
      fonte: parsed.data.fonte || "",
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5),
    });
    // Convert md-ish to simple paragraphs
    const html = md
      .split(/\n\n+/)
      .map((p) => `<p>${p.replace(/\n/g, "<br/>").replace(/^#+\s*/, "")}</p>`)
      .join("");

    const [nota] = db
      .insert(notas)
      .values({
        titulo: parsed.data.title || tpl.nome,
        tipo: "conceitual",
        status: "capturado",
        tags: ["template", tpl.id],
      })
      .returning()
      .all();

    if (nota) {
      db.insert(blocos)
        .values({ notaId: nota.id, tipo: "paragrafo", conteudo: html, ordem: 0 })
        .run();
    }

    return NextResponse.json({ data: nota, preview: md }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Falha" }, { status: 500 });
  }
}
