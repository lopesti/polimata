/**
 * Motor de sugestão de Method Stacks — regras determinísticas (MVP).
 * Entrada: tipo de conteúdo + objetivo + prazo (dias) + esforço máximo.
 */

export type TipoConteudo = "factual" | "conceitual" | "procedural" | "abstrato" | "misto";
export type Objetivo = "compreender" | "memorizar" | "aplicar" | "ensinar" | "criar";

export type SugestaoMetodo = {
  nome: string;
  categoria: string;
  motivo: string;
  ordem: number;
};

export type SugestaoStack = {
  nome: string;
  objetivo: Objetivo;
  metodos: SugestaoMetodo[];
  justificativa: string;
};

const MAP: Record<
  string,
  { nomes: string[]; motivo: string }[]
> = {
  "factual|memorizar": [
    { nomes: ["Flashcard básico", "Cloze deletion", "Spaced Repetition (FSRS)"], motivo: "Fatos isolados respondem bem a cards + FSRS" },
    { nomes: ["Active Recall"], motivo: "Força recuperação antes da revisão" },
  ],
  "factual|compreender": [
    { nomes: ["Nota atômica", "Flashcard básico"], motivo: "Destilar e fixar o fato no contexto" },
  ],
  "conceitual|compreender": [
    { nomes: ["Preview em 3 passadas", "Nota atômica", "Feynman Technique"], motivo: "Conceitos precisam de estrutura + explicação própria" },
    { nomes: ["Mapa mental"], motivo: "Relações entre ideias" },
  ],
  "conceitual|memorizar": [
    { nomes: ["Nota atômica", "Cloze deletion", "Spaced Repetition (FSRS)"], motivo: "Conceito destilado vira cloze estável" },
  ],
  "conceitual|ensinar": [
    { nomes: ["Feynman Technique", "Ensinar alguém", "Nota atômica"], motivo: "Ensinar revela lacunas" },
  ],
  "procedural|aplicar": [
    { nomes: ["Prática deliberada", "Projeto mínimo viável"], motivo: "Procedimento só vira domínio com uso" },
    { nomes: ["Planejamento de sessão"], motivo: "Define critério de sucesso" },
  ],
  "procedural|compreender": [
    { nomes: ["Nota atômica", "Prática deliberada"], motivo: "Entender o porquê e treinar o como" },
  ],
  "abstrato|compreender": [
    { nomes: ["Feynman Technique", "Mapa mental", "Discussão Socrática"], motivo: "Abstração exige múltiplos ângulos" },
  ],
  "abstrato|criar": [
    { nomes: ["Mapa mental", "Projeto mínimo viável", "Diário metacognitivo"], motivo: "Criar a partir de síntese + reflexão" },
  ],
  "misto|compreender": [
    { nomes: ["Preview em 3 passadas", "RSVP (Rapid Serial Visual Presentation)", "Nota atômica", "Active Recall"], motivo: "Pipeline completo de entrada → destilação → teste" },
  ],
};

const FALLBACK: { nomes: string[]; motivo: string }[] = [
  { nomes: ["Planejamento de sessão", "Nota atômica", "Active Recall"], motivo: "Stack genérico seguro" },
  { nomes: ["Diário metacognitivo"], motivo: "Fecha o loop de metacognição" },
];

export function sugerirStack(input: {
  tipo: TipoConteudo;
  objetivo: Objetivo;
  titulo?: string;
  prazoDias?: number;
}): SugestaoStack {
  const key = `${input.tipo}|${input.objetivo}`;
  const rules = MAP[key] ?? FALLBACK;

  const metodos: SugestaoMetodo[] = [];
  let ordem = 0;
  for (const rule of rules) {
    for (const nome of rule.nomes) {
      if (metodos.some((m) => m.nome === nome)) continue;
      metodos.push({
        nome,
        categoria: guessCategoria(nome),
        motivo: rule.motivo,
        ordem: ordem++,
      });
    }
  }

  // Prazo curto → prioriza memória/FSRS
  if ((input.prazoDias ?? 99) <= 7) {
    const boost = ["Flashcard básico", "Cloze deletion", "Spaced Repetition (FSRS)", "Active Recall"];
    for (const nome of boost) {
      if (!metodos.some((m) => m.nome === nome)) {
        metodos.push({
          nome,
          categoria: "memoria",
          motivo: "Prazo curto: reforço de retenção",
          ordem: ordem++,
        });
      }
    }
  }

  const nome = input.titulo
    ? `Stack: ${input.titulo.slice(0, 40)}`
    : `Stack ${input.objetivo} (${input.tipo})`;

  return {
    nome,
    objetivo: input.objetivo,
    metodos,
    justificativa: `Regras para tipo=${input.tipo} + objetivo=${input.objetivo}${
      input.prazoDias ? ` + prazo ${input.prazoDias}d` : ""
    }. Método é ferramenta, não dogma — ajuste livremente.`,
  };
}

function guessCategoria(nome: string): string {
  const n = nome.toLowerCase();
  if (n.includes("rsvp") || n.includes("preview") || n.includes("highlight")) return "leitura";
  if (n.includes("feynman") || n.includes("nota") || n.includes("mapa")) return "compreensao";
  if (n.includes("flash") || n.includes("cloze") || n.includes("fsrs") || n.includes("recall") || n.includes("occlusion"))
    return "memoria";
  if (n.includes("prática") || n.includes("projeto")) return "aplicacao";
  if (n.includes("ensinar") || n.includes("socrática")) return "social";
  if (n.includes("tts") || n.includes("áudio") || n.includes("playlist")) return "audio";
  return "metacognicao";
}

/** Atualiza eficácia pessoal com média ponderada simples */
export function atualizarEficacia(
  atual: number,
  acertos: number,
  erros: number,
  dificuldade: number // 1-5
): number {
  const total = acertos + erros;
  if (total === 0) return atual;
  const taxa = acertos / total;
  // dificuldade alta com bons acertos → bônus
  const score = taxa * 5 - (dificuldade - 3) * 0.2;
  const novo = atual * 0.7 + score * 0.3;
  return Math.min(5, Math.max(1, Math.round(novo * 10) / 10));
}
