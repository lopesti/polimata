/** Extract [[Title]] references from plain text or HTML */
export function extractWikiTitles(text: string): string[] {
  const titles = new Set<string>();
  const re = /\[\[([^\]]+)\]\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const t = m[1]?.trim();
    if (t) titles.add(t);
  }
  return Array.from(titles);
}

export function normalizeTitle(t: string) {
  return t.trim().toLowerCase();
}
