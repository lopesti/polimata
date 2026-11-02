import { NextRequest, NextResponse } from "next/server";
import { importJsonBackup } from "@/lib/import/json-import";
import { parseMarkdownNote } from "@/lib/import/markdown-import";
import { db } from "@/lib/db/client";
import { notas, blocos } from "@/lib/db/schema";
import { rebuildFtsIndex } from "@/lib/db/fts";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const payload = await req.json();
      if (payload.markdown && typeof payload.markdown === "string") {
        const parsed = parseMarkdownNote(payload.markdown);
        const [nota] = db
          .insert(notas)
          .values({
            titulo: parsed.titulo,
            tipo: parsed.tipo,
            status: "capturado",
            tags: parsed.tags,
          })
          .returning()
          .all();
        if (nota && parsed.bodyHtml) {
          db.insert(blocos)
            .values({
              notaId: nota.id,
              tipo: "paragrafo",
              conteudo: parsed.bodyHtml,
              ordem: 0,
            })
            .run();
        }
        try {
          rebuildFtsIndex();
        } catch {}
        return NextResponse.json({ data: { nota } }, { status: 201 });
      }

      const result = importJsonBackup(payload);
      try {
        rebuildFtsIndex();
      } catch {}
      return NextResponse.json({ data: result });
    }

    return NextResponse.json(
      { error: "Envie JSON (backup ou { markdown: '...' })" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[POST /api/import]", error);
    return NextResponse.json({ error: "Falha no import" }, { status: 500 });
  }
}
