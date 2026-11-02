import { db } from "@/lib/db/client";
import { diarioMetacognitivo, metodos, sessoes } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { atualizarEficacia } from "./regras";

/**
 * Lê diário recente + sessões e ajusta eficaciaPessoal dos métodos mencionados.
 * Heurística: menção em "o que funcionou" sobe; em "o que ajustar" desce levemente.
 */
export function aprenderComDiario(): {
  adjusted: { id: string; nome: string; before: number; after: number }[];
} {
  const entries = db
    .select()
    .from(diarioMetacognitivo)
    .orderBy(desc(diarioMetacognitivo.data))
    .limit(20)
    .all();

  const allMetodos = db.select().from(metodos).all();
  const adjusted: { id: string; nome: string; before: number; after: number }[] = [];

  for (const m of allMetodos) {
    let delta = 0;
    const nome = m.nome.toLowerCase();
    for (const e of entries) {
      const ok = (e.oQueFuncionou ?? "").toLowerCase();
      const bad = (e.oQueAjustar ?? "").toLowerCase();
      if (ok.includes(nome) || (e.metodosTestados ?? []).some((t) => t.toLowerCase() === nome)) {
        delta += 0.15;
      }
      if (bad.includes(nome)) delta -= 0.1;
    }
    if (Math.abs(delta) < 0.05) continue;
    const before = Number(m.eficaciaPessoal ?? 3);
    const after = Math.min(5, Math.max(1, Math.round((before + delta) * 10) / 10));
    if (after !== before) {
      db.update(metodos)
        .set({ eficaciaPessoal: after })
        .where(eq(metodos.id, m.id))
        .run();
      adjusted.push({ id: m.id, nome: m.nome, before, after });
    }
  }

  // Sessões recentes também alimentam
  const recentSess = db.select().from(sessoes).orderBy(desc(sessoes.data)).limit(30).all();
  for (const s of recentSess) {
    if (!s.metodoId) continue;
    const [m] = db.select().from(metodos).where(eq(metodos.id, s.metodoId)).all();
    if (!m) continue;
    const before = Number(m.eficaciaPessoal ?? 3);
    const after = atualizarEficacia(
      before,
      s.acertos ?? 0,
      s.erros ?? 0,
      s.dificuldade ?? 3
    );
    if (after !== before) {
      db.update(metodos)
        .set({ eficaciaPessoal: after })
        .where(eq(metodos.id, m.id))
        .run();
      if (!adjusted.some((a) => a.id === m.id)) {
        adjusted.push({ id: m.id, nome: m.nome, before, after });
      }
    }
  }

  return { adjusted };
}
