export type TipoFonte = "artigo" | "livro" | "video" | "pdf" | "podcast" | "web" | "outro";
export type StatusFonte = "capturado" | "triado" | "processado" | "testado" | "dominado";
export type TipoNota = "factual" | "conceitual" | "procedural" | "abstrato";
export type StatusNota =
  | "capturado"
  | "triado"
  | "processado"
  | "testado"
  | "revisado"
  | "aplicado"
  | "dominado";
export type CategoriaMetodo =
  | "leitura"
  | "compreensao"
  | "memoria"
  | "aplicacao"
  | "social"
  | "audio"
  | "metacognicao";
export type ObjetivoStack = "compreender" | "memorizar" | "aplicar" | "ensinar" | "criar";
export type ModoStack = "livre" | "sugerido" | "automatico";
export type StatusStack = "ativo" | "concluido" | "arquivado";

export interface Fonte {
  id: string;
  titulo: string;
  autor: string | null;
  tipo: TipoFonte;
  url: string | null;
  tema: string | null;
  status: StatusFonte | null;
  ppmLeitura: number | null;
  audioGerado: boolean | null;
  conteudoBruto: string | null;
  metadados: unknown;
  criadoEm: Date | null;
  atualizadoEm: Date | null;
}

export interface Nota {
  id: string;
  fonteId: string | null;
  titulo: string | null;
  tipo: TipoNota;
  status: StatusNota | null;
  tags: string[] | null;
  criadoEm: Date | null;
  atualizadoEm: Date | null;
}

export interface Metodo {
  id: string;
  nome: string;
  categoria: CategoriaMetodo;
  paraQue: string | null;
  quandoUsar: string | null;
  tempoTipico: number | null;
  esforco: number | null;
  eficaciaPessoal: number | null;
  notas: string | null;
  criadoEm: Date | null;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
