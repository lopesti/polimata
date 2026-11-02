/** Anki-compatible TSV: Front\tBack\tTags */
export function perguntasToAnkiTsv(
  rows: { frente: string; verso: string; tipo?: string; tags?: string[] }[]
): string {
  const lines = ["#separator:tab", "#html:true"];
  for (const r of rows) {
    const front = escapeCell(r.frente);
    const back = escapeCell(r.verso);
    const tags = ["polimata", r.tipo ?? "basico", ...(r.tags ?? [])].join(" ");
    lines.push(`${front}\t${back}\t${tags}`);
  }
  return lines.join("\n");
}

function escapeCell(s: string) {
  return s.replace(/\t/g, " ").replace(/\n/g, "<br>");
}
