import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { notas, blocos } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

function htmlToMd(html: string): string {
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n")
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n")
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n")
    .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<em>(.*?)<\/em>/gi, "*$1*")
    .replace(/<li>(.*?)<\/li>/gi, "- $1\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Export all notes as a single Obsidian-friendly markdown "vault dump" */
export async function GET() {
  try {
    const all = db.select().from(notas).all();
    const parts: string[] = [
      `# Polimata vault export`,
      `exported: ${new Date().toISOString()}`,
      ``,
    ];

    for (const n of all) {
      const tags = ((n.tags as string[]) ?? []).map((t) => `#${t}`).join(" ");
      const bodyBlocks = db
        .select()
        .from(blocos)
        .where(eq(blocos.notaId, n.id))
        .orderBy(asc(blocos.ordem))
        .all();
      const body = bodyBlocks.map((b) => htmlToMd(b.conteudo)).join("\n\n");
      parts.push(
        `---`,
        `title: "${(n.titulo ?? "Sem título").replace(/"/g, '\\"')}"`,
        `tipo: ${n.tipo}`,
        `status: ${n.status}`,
        `tags: [${((n.tags as string[]) ?? []).join(", ")}]`,
        `polimata_id: ${n.id}`,
        `---`,
        ``,
        `# ${n.titulo ?? "Sem título"}`,
        tags,
        ``,
        body,
        ``,
        ``
      );
    }

    const md = parts.join("\n");
    return new NextResponse(md, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="polimata-obsidian-${Date.now()}.md"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Falha no export Obsidian" }, { status: 500 });
  }
}
