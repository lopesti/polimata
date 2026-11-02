/** Parse simple markdown note with optional YAML frontmatter */
export function parseMarkdownNote(md: string): {
  titulo: string;
  tags: string[];
  tipo: "factual" | "conceitual" | "procedural" | "abstrato";
  bodyHtml: string;
} {
  let titulo = "Nota importada";
  let tags: string[] = [];
  let tipo: "factual" | "conceitual" | "procedural" | "abstrato" = "conceitual";
  let body = md;

  if (md.startsWith("---")) {
    const end = md.indexOf("---", 3);
    if (end > 0) {
      const fm = md.slice(3, end).trim();
      body = md.slice(end + 3).trim();
      for (const line of fm.split("\n")) {
        const [k, ...rest] = line.split(":");
        const v = rest.join(":").trim().replace(/^["']|["']$/g, "");
        if (!k) continue;
        const key = k.trim().toLowerCase();
        if (key === "title" || key === "titulo") titulo = v;
        if (key === "tags") {
          tags = v
            .replace(/[\[\]]/g, "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
        }
        if (key === "tipo" && ["factual", "conceitual", "procedural", "abstrato"].includes(v)) {
          tipo = v as typeof tipo;
        }
      }
    }
  }

  // First H1 as title if no frontmatter title
  const h1 = body.match(/^#\s+(.+)$/m);
  if (h1 && titulo === "Nota importada") {
    titulo = h1[1]!.trim();
    body = body.replace(/^#\s+.+$/m, "").trim();
  }

  // Very small md → html
  let html = body
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .split(/\n\n+/)
    .map((p) => {
      if (p.startsWith("<")) return p;
      return `<p>${p.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("");

  return { titulo, tags, tipo, bodyHtml: html };
}
