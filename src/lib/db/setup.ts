import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const url = process.env.DATABASE_URL ?? "file:./data/polimata.db";
const file = url.replace(/^file:/, "");

const dir = path.dirname(file);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const sqlite = new Database(file);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

sqlite.exec(`
CREATE TABLE IF NOT EXISTS fontes (
  id text PRIMARY KEY NOT NULL,
  titulo text NOT NULL,
  autor text,
  tipo text NOT NULL,
  url text,
  tema text,
  status text DEFAULT 'capturado',
  ppm_leitura integer,
  audio_gerado integer DEFAULT false,
  conteudo_bruto text,
  metadados text,
  criado_em integer DEFAULT (unixepoch()),
  atualizado_em integer DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS fontes_status_idx ON fontes (status);
CREATE INDEX IF NOT EXISTS fontes_tema_idx ON fontes (tema);

CREATE TABLE IF NOT EXISTS notas (
  id text PRIMARY KEY NOT NULL,
  fonte_id text,
  titulo text,
  tipo text NOT NULL,
  status text DEFAULT 'capturado',
  tags text DEFAULT '[]',
  criado_em integer DEFAULT (unixepoch()),
  atualizado_em integer DEFAULT (unixepoch()),
  FOREIGN KEY (fonte_id) REFERENCES fontes(id) ON DELETE set null
);
CREATE INDEX IF NOT EXISTS notas_status_idx ON notas (status);
CREATE INDEX IF NOT EXISTS notas_tipo_idx ON notas (tipo);

CREATE TABLE IF NOT EXISTS blocos (
  id text PRIMARY KEY NOT NULL,
  nota_id text NOT NULL,
  pai_id text,
  tipo text NOT NULL,
  conteudo text NOT NULL,
  ordem integer NOT NULL,
  metadados text,
  criado_em integer DEFAULT (unixepoch()),
  FOREIGN KEY (nota_id) REFERENCES notas(id) ON DELETE cascade
);
CREATE INDEX IF NOT EXISTS blocos_nota_idx ON blocos (nota_id);

CREATE TABLE IF NOT EXISTS metodos (
  id text PRIMARY KEY NOT NULL,
  nome text NOT NULL,
  categoria text NOT NULL,
  para_que text,
  quando_usar text,
  tempo_tipico integer,
  esforco integer,
  eficacia_pessoal real DEFAULT 3,
  notas text,
  criado_em integer DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS metodos_categoria_idx ON metodos (categoria);

CREATE TABLE IF NOT EXISTS stacks (
  id text PRIMARY KEY NOT NULL,
  nome text NOT NULL,
  fonte_id text,
  nota_id text,
  objetivo text NOT NULL,
  prazo integer,
  modo text DEFAULT 'sugerido',
  status text DEFAULT 'ativo',
  criado_em integer DEFAULT (unixepoch()),
  FOREIGN KEY (fonte_id) REFERENCES fontes(id) ON DELETE cascade,
  FOREIGN KEY (nota_id) REFERENCES notas(id) ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS stack_metodos (
  id text PRIMARY KEY NOT NULL,
  stack_id text NOT NULL,
  metodo_id text NOT NULL,
  ordem integer NOT NULL,
  concluido integer DEFAULT false,
  FOREIGN KEY (stack_id) REFERENCES stacks(id) ON DELETE cascade,
  FOREIGN KEY (metodo_id) REFERENCES metodos(id) ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS perguntas (
  id text PRIMARY KEY NOT NULL,
  nota_id text,
  bloco_id text,
  tipo text NOT NULL,
  frente text NOT NULL,
  verso text NOT NULL,
  dificuldade real DEFAULT 0,
  estabilidade real DEFAULT 0,
  facilidade real DEFAULT 2.5,
  repeticoes integer DEFAULT 0,
  lapsos integer DEFAULT 0,
  estado text DEFAULT 'novo',
  proxima_revisao integer,
  ultima_revisao integer,
  criado_em integer DEFAULT (unixepoch()),
  FOREIGN KEY (nota_id) REFERENCES notas(id) ON DELETE cascade,
  FOREIGN KEY (bloco_id) REFERENCES blocos(id) ON DELETE set null
);
CREATE INDEX IF NOT EXISTS perguntas_estado_idx ON perguntas (estado);
CREATE INDEX IF NOT EXISTS perguntas_proxima_idx ON perguntas (proxima_revisao);

CREATE TABLE IF NOT EXISTS revisoes (
  id text PRIMARY KEY NOT NULL,
  pergunta_id text NOT NULL,
  rating integer NOT NULL,
  duracao_ms integer,
  revisado_em integer DEFAULT (unixepoch()),
  FOREIGN KEY (pergunta_id) REFERENCES perguntas(id) ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS sessoes (
  id text PRIMARY KEY NOT NULL,
  stack_id text,
  metodo_id text,
  data integer DEFAULT (unixepoch()),
  duracao integer,
  dificuldade integer,
  acertos integer,
  erros integer,
  ajuste text,
  metadados text,
  FOREIGN KEY (stack_id) REFERENCES stacks(id) ON DELETE set null,
  FOREIGN KEY (metodo_id) REFERENCES metodos(id) ON DELETE set null
);

CREATE TABLE IF NOT EXISTS diario_metacognitivo (
  id text PRIMARY KEY NOT NULL,
  data integer DEFAULT (unixepoch()),
  o_que_funcionou text,
  o_que_ajustar text,
  metodos_testados text,
  humor integer
);

CREATE TABLE IF NOT EXISTS links (
  id text PRIMARY KEY NOT NULL,
  origem_tipo text NOT NULL,
  origem_id text NOT NULL,
  destino_tipo text NOT NULL,
  destino_id text NOT NULL,
  tipo_link text DEFAULT 'relacionado',
  criado_em integer DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS links_origem_idx ON links (origem_tipo, origem_id);
CREATE INDEX IF NOT EXISTS links_destino_idx ON links (destino_tipo, destino_id);

CREATE TABLE IF NOT EXISTS tags (
  id text PRIMARY KEY NOT NULL,
  nome text NOT NULL,
  cor text
);
CREATE UNIQUE INDEX IF NOT EXISTS tags_nome_unique ON tags (nome);

CREATE TABLE IF NOT EXISTS tag_links (
  id text PRIMARY KEY NOT NULL,
  tag_id text NOT NULL,
  objeto_tipo text NOT NULL,
  objeto_id text NOT NULL,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS audios (
  id text PRIMARY KEY NOT NULL,
  nota_id text,
  pergunta_id text,
  texto_fonte text NOT NULL,
  caminho_arquivo text,
  voz text,
  velocidade real DEFAULT 1.5,
  duracao_ms integer,
  criado_em integer DEFAULT (unixepoch()),
  FOREIGN KEY (nota_id) REFERENCES notas(id) ON DELETE cascade,
  FOREIGN KEY (pergunta_id) REFERENCES perguntas(id) ON DELETE cascade
);
`);

sqlite.close();
console.log("✅ Schema OK:", file);