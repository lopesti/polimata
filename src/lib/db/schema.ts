import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const fontes = sqliteTable("fontes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  titulo: text("titulo").notNull(),
  autor: text("autor"),
  tipo: text("tipo", { enum: ["artigo", "livro", "video", "pdf", "podcast", "web", "outro"] }).notNull(),
  url: text("url"),
  tema: text("tema"),
  status: text("status", { enum: ["capturado", "triado", "processado", "testado", "dominado"] }).default("capturado"),
  ppmLeitura: integer("ppm_leitura"),
  audioGerado: integer("audio_gerado", { mode: "boolean" }).default(false),
  conteudoBruto: text("conteudo_bruto"),
  metadados: text("metadados", { mode: "json" }),
  criadoEm: integer("criado_em", { mode: "timestamp" }).default(sql`(unixepoch())`),
  atualizadoEm: integer("atualizado_em", { mode: "timestamp" }).default(sql`(unixepoch())`),
}, (t) => ({
  statusIdx: index("fontes_status_idx").on(t.status),
  temaIdx: index("fontes_tema_idx").on(t.tema),
}));

export const notas = sqliteTable("notas", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  fonteId: text("fonte_id").references(() => fontes.id, { onDelete: "set null" }),
  titulo: text("titulo"),
  tipo: text("tipo", { enum: ["factual", "conceitual", "procedural", "abstrato"] }).notNull(),
  status: text("status", { enum: ["capturado", "triado", "processado", "testado", "revisado", "aplicado", "dominado"] }).default("capturado"),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
  criadoEm: integer("criado_em", { mode: "timestamp" }).default(sql`(unixepoch())`),
  atualizadoEm: integer("atualizado_em", { mode: "timestamp" }).default(sql`(unixepoch())`),
}, (t) => ({
  statusIdx: index("notas_status_idx").on(t.status),
  tipoIdx: index("notas_tipo_idx").on(t.tipo),
}));

export const blocos = sqliteTable("blocos", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  notaId: text("nota_id").references(() => notas.id, { onDelete: "cascade" }).notNull(),
  paiId: text("pai_id"),
  tipo: text("tipo", { enum: ["paragrafo", "heading", "callout", "codigo", "imagem", "toggle", "lista", "tabela"] }).notNull(),
  conteudo: text("conteudo").notNull(),
  ordem: integer("ordem").notNull(),
  metadados: text("metadados", { mode: "json" }),
  criadoEm: integer("criado_em", { mode: "timestamp" }).default(sql`(unixepoch())`),
}, (t) => ({
  notaIdx: index("blocos_nota_idx").on(t.notaId),
}));

export const perguntas = sqliteTable("perguntas", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  notaId: text("nota_id").references(() => notas.id, { onDelete: "cascade" }),
  blocoId: text("bloco_id").references(() => blocos.id, { onDelete: "set null" }),
  tipo: text("tipo", { enum: ["basico", "cloze", "image_occlusion", "multipla_escolha"] }).notNull(),
  frente: text("frente").notNull(),
  verso: text("verso").notNull(),
  dificuldade: real("dificuldade").default(0),
  estabilidade: real("estabilidade").default(0),
  facilidade: real("facilidade").default(2.5),
  repeticoes: integer("repeticoes").default(0),
  lapsos: integer("lapsos").default(0),
  estado: text("estado", { enum: ["novo", "aprendendo", "revisao", "reaprendendo"] }).default("novo"),
  proximaRevisao: integer("proxima_revisao", { mode: "timestamp" }),
  ultimaRevisao: integer("ultima_revisao", { mode: "timestamp" }),
  criadoEm: integer("criado_em", { mode: "timestamp" }).default(sql`(unixepoch())`),
}, (t) => ({
  estadoIdx: index("perguntas_estado_idx").on(t.estado),
  proximaIdx: index("perguntas_proxima_idx").on(t.proximaRevisao),
}));

export const revisoes = sqliteTable("revisoes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  perguntaId: text("pergunta_id").references(() => perguntas.id, { onDelete: "cascade" }).notNull(),
  rating: integer("rating").notNull(),
  duracaoMs: integer("duracao_ms"),
  revisadoEm: integer("revisado_em", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const metodos = sqliteTable("metodos", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  nome: text("nome").notNull(),
  categoria: text("categoria", { enum: ["leitura", "compreensao", "memoria", "aplicacao", "social", "audio", "metacognicao"] }).notNull(),
  paraQue: text("para_que"),
  quandoUsar: text("quando_usar"),
  tempoTipico: integer("tempo_tipico"),
  esforco: integer("esforco"),
  eficaciaPessoal: real("eficacia_pessoal").default(3),
  notas: text("notas"),
  criadoEm: integer("criado_em", { mode: "timestamp" }).default(sql`(unixepoch())`),
}, (t) => ({
  categoriaIdx: index("metodos_categoria_idx").on(t.categoria),
}));

export const stacks = sqliteTable("stacks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  nome: text("nome").notNull(),
  fonteId: text("fonte_id").references(() => fontes.id, { onDelete: "cascade" }),
  notaId: text("nota_id").references(() => notas.id, { onDelete: "cascade" }),
  objetivo: text("objetivo", { enum: ["compreender", "memorizar", "aplicar", "ensinar", "criar"] }).notNull(),
  prazo: integer("prazo", { mode: "timestamp" }),
  modo: text("modo", { enum: ["livre", "sugerido", "automatico"] }).default("sugerido"),
  status: text("status", { enum: ["ativo", "concluido", "arquivado"] }).default("ativo"),
  criadoEm: integer("criado_em", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const stackMetodos = sqliteTable("stack_metodos", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  stackId: text("stack_id").references(() => stacks.id, { onDelete: "cascade" }).notNull(),
  metodoId: text("metodo_id").references(() => metodos.id, { onDelete: "cascade" }).notNull(),
  ordem: integer("ordem").notNull(),
  concluido: integer("concluido", { mode: "boolean" }).default(false),
});

export const sessoes = sqliteTable("sessoes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  stackId: text("stack_id").references(() => stacks.id, { onDelete: "set null" }),
  metodoId: text("metodo_id").references(() => metodos.id, { onDelete: "set null" }),
  data: integer("data", { mode: "timestamp" }).default(sql`(unixepoch())`),
  duracao: integer("duracao"),
  dificuldade: integer("dificuldade"),
  acertos: integer("acertos"),
  erros: integer("erros"),
  ajuste: text("ajuste"),
  metadados: text("metadados", { mode: "json" }),
});

export const diarioMetacognitivo = sqliteTable("diario_metacognitivo", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  data: integer("data", { mode: "timestamp" }).default(sql`(unixepoch())`),
  oQueFuncionou: text("o_que_funcionou"),
  oQueAjustar: text("o_que_ajustar"),
  metodosTestados: text("metodos_testados", { mode: "json" }).$type<string[]>(),
  humor: integer("humor"),
});

export const audios = sqliteTable("audios", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  notaId: text("nota_id").references(() => notas.id, { onDelete: "cascade" }),
  perguntaId: text("pergunta_id").references(() => perguntas.id, { onDelete: "cascade" }),
  textoFonte: text("texto_fonte").notNull(),
  caminhoArquivo: text("caminho_arquivo"),
  voz: text("voz"),
  velocidade: real("velocidade").default(1.5),
  duracaoMs: integer("duracao_ms"),
  criadoEm: integer("criado_em", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const links = sqliteTable("links", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  origemTipo: text("origem_tipo", { enum: ["fonte", "nota", "bloco", "pergunta", "metodo", "stack"] }).notNull(),
  origemId: text("origem_id").notNull(),
  destinoTipo: text("destino_tipo", { enum: ["fonte", "nota", "bloco", "pergunta", "metodo", "stack"] }).notNull(),
  destinoId: text("destino_id").notNull(),
  tipoLink: text("tipo_link", { enum: ["referencia", "deriva", "contradiz", "exemplifica", "relacionado"] }).default("relacionado"),
  criadoEm: integer("criado_em", { mode: "timestamp" }).default(sql`(unixepoch())`),
}, (t) => ({
  origemIdx: index("links_origem_idx").on(t.origemTipo, t.origemId),
  destinoIdx: index("links_destino_idx").on(t.destinoTipo, t.destinoId),
}));

export const tags = sqliteTable("tags", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  nome: text("nome").notNull().unique(),
  cor: text("cor"),
});

export const tagLinks = sqliteTable("tag_links", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tagId: text("tag_id").references(() => tags.id, { onDelete: "cascade" }).notNull(),
  objetoTipo: text("objeto_tipo").notNull(),
  objetoId: text("objeto_id").notNull(),
});

export type Fonte = typeof fontes.$inferSelect;
export type Nota = typeof notas.$inferSelect;
export type Bloco = typeof blocos.$inferSelect;
export type Pergunta = typeof perguntas.$inferSelect;
export type Metodo = typeof metodos.$inferSelect;
export type Stack = typeof stacks.$inferSelect;
export type Sessao = typeof sessoes.$inferSelect;
