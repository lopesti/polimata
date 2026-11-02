import { sqlite } from "./client";

/**
 * Ensure FTS5 virtual table exists and is usable.
 * Called lazily on first search or after seed.
 */
export function ensureFts() {
  sqlite.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS busca_global USING fts5(
      objeto_tipo,
      objeto_id,
      titulo,
      conteudo,
      tokenize = 'unicode61'
    );
  `);
}

export function rebuildFtsIndex() {
  ensureFts();
  sqlite.exec("DELETE FROM busca_global;");

  // Fontes
  sqlite
    .prepare(
      `INSERT INTO busca_global (objeto_tipo, objeto_id, titulo, conteudo)
       SELECT 'fonte', id, titulo, COALESCE(conteudo_bruto, '') || ' ' || COALESCE(autor, '') || ' ' || COALESCE(tema, '')
       FROM fontes`
    )
    .run();

  // Notas
  sqlite
    .prepare(
      `INSERT INTO busca_global (objeto_tipo, objeto_id, titulo, conteudo)
       SELECT 'nota', id, COALESCE(titulo, ''), COALESCE(tags, '')
       FROM notas`
    )
    .run();

  // Blocos (content of notes)
  sqlite
    .prepare(
      `INSERT INTO busca_global (objeto_tipo, objeto_id, titulo, conteudo)
       SELECT 'bloco', b.id, COALESCE(n.titulo, ''), b.conteudo
       FROM blocos b
       LEFT JOIN notas n ON n.id = b.nota_id`
    )
    .run();

  // Métodos
  sqlite
    .prepare(
      `INSERT INTO busca_global (objeto_tipo, objeto_id, titulo, conteudo)
       SELECT 'metodo', id, nome, COALESCE(para_que, '') || ' ' || COALESCE(quando_usar, '') || ' ' || COALESCE(notas, '')
       FROM metodos`
    )
    .run();
}

export type SearchHit = {
  objeto_tipo: string;
  objeto_id: string;
  titulo: string;
  snippet: string;
};

export function searchFts(query: string, limit = 20): SearchHit[] {
  if (!query.trim()) return [];
  ensureFts();

  // Escape FTS5 special chars loosely
  const safe = query
    .trim()
    .replace(/["*()]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => `"${t}"*`)
    .join(" ");

  if (!safe) return [];

  try {
    const rows = sqlite
      .prepare(
        `SELECT objeto_tipo, objeto_id, titulo,
                snippet(busca_global, 3, '<mark>', '</mark>', '…', 12) AS snippet
         FROM busca_global
         WHERE busca_global MATCH ?
         ORDER BY rank
         LIMIT ?`
      )
      .all(safe, limit) as SearchHit[];
    return rows;
  } catch {
    // If index empty / first run, rebuild and retry once
    rebuildFtsIndex();
    try {
      return sqlite
        .prepare(
          `SELECT objeto_tipo, objeto_id, titulo,
                  snippet(busca_global, 3, '<mark>', '</mark>', '…', 12) AS snippet
           FROM busca_global
           WHERE busca_global MATCH ?
           ORDER BY rank
           LIMIT ?`
        )
        .all(safe, limit) as SearchHit[];
    } catch {
      return [];
    }
  }
}
