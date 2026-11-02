import { db } from "./client";
import { metodos, fontes, notas, blocos, perguntas } from "./schema";
import { count } from "drizzle-orm";
import { rebuildFtsIndex } from "./fts";

const METODOS_SEED = [
  { nome: "RSVP (Rapid Serial Visual Presentation)", categoria: "leitura" as const, paraQue: "Ler texto em alta velocidade palavra por palavra", quandoUsar: "Textos densos, artigos longos", tempoTipico: 15, esforco: 3 },
  { nome: "Preview em 3 passadas", categoria: "leitura" as const, paraQue: "Mapear estrutura antes de ler em profundidade", quandoUsar: "Livros e papers", tempoTipico: 10, esforco: 2 },
  { nome: "Highlight ativo", categoria: "leitura" as const, paraQue: "Capturar trechos relevantes durante a leitura", quandoUsar: "Qualquer leitura", tempoTipico: 5, esforco: 1 },
  { nome: "Nota atômica", categoria: "compreensao" as const, paraQue: "Destilar uma ideia em um bloco autônomo", quandoUsar: "Após highlight ou insight", tempoTipico: 8, esforco: 3 },
  { nome: "Feynman Technique", categoria: "compreensao" as const, paraQue: "Explicar com palavras simples para revelar lacunas", quandoUsar: "Conceitos complexos", tempoTipico: 20, esforco: 4 },
  { nome: "Mapa mental", categoria: "compreensao" as const, paraQue: "Visualizar relações entre ideias", quandoUsar: "Temas com muitas conexões", tempoTipico: 25, esforco: 3 },
  { nome: "Cloze deletion", categoria: "memoria" as const, paraQue: "Criar flashcards de preenchimento de lacuna", quandoUsar: "Fatos, definições, fórmulas", tempoTipico: 10, esforco: 2 },
  { nome: "Flashcard básico", categoria: "memoria" as const, paraQue: "Pergunta/resposta simples com FSRS", quandoUsar: "Vocabulário e fatos isolados", tempoTipico: 5, esforco: 2 },
  { nome: "Image occlusion", categoria: "memoria" as const, paraQue: "Ocultar partes de imagens/diagramas", quandoUsar: "Anatomia, mapas, diagramas", tempoTipico: 15, esforco: 3 },
  { nome: "Active Recall", categoria: "memoria" as const, paraQue: "Recuperar informação da memória sem olhar", quandoUsar: "Antes de qualquer revisão", tempoTipico: 10, esforco: 4 },
  { nome: "Spaced Repetition (FSRS)", categoria: "memoria" as const, paraQue: "Revisar no momento ótimo de retenção", quandoUsar: "Tudo que precisa ser memorizado", tempoTipico: 20, esforco: 2 },
  { nome: "Prática deliberada", categoria: "aplicacao" as const, paraQue: "Aplicar conhecimento em problemas reais", quandoUsar: "Habilidades e procedimentos", tempoTipico: 45, esforco: 5 },
  { nome: "Projeto mínimo viável", categoria: "aplicacao" as const, paraQue: "Criar algo pequeno que use o que aprendeu", quandoUsar: "Após compreender o núcleo", tempoTipico: 60, esforco: 5 },
  { nome: "Ensinar alguém", categoria: "social" as const, paraQue: "Explicar para outra pessoa e receber feedback", quandoUsar: "Conceitos que você acha que dominou", tempoTipico: 30, esforco: 4 },
  { nome: "Discussão Socrática", categoria: "social" as const, paraQue: "Questionar premissas e aprofundar entendimento", quandoUsar: "Temas controversos ou filosóficos", tempoTipico: 40, esforco: 4 },
  { nome: "TTS / Áudio de revisão", categoria: "audio" as const, paraQue: "Ouvir notas destiladas em tempo morto", quandoUsar: "Commute, exercício, tarefas domésticas", tempoTipico: 20, esforco: 1 },
  { nome: "Playlist de resurface", categoria: "audio" as const, paraQue: "Highlights antigos reaparecem em áudio", quandoUsar: "Revisão passiva de longo prazo", tempoTipico: 15, esforco: 1 },
  { nome: "Diário metacognitivo", categoria: "metacognicao" as const, paraQue: "Registrar o que funcionou e o que ajustar", quandoUsar: "Fim de semana / fim de sprint", tempoTipico: 15, esforco: 2 },
  { nome: "Planejamento de sessão", categoria: "metacognicao" as const, paraQue: "Definir objetivo, método e tempo antes de começar", quandoUsar: "Antes de qualquer sessão de estudo", tempoTipico: 5, esforco: 1 },
  { nome: "Retrospectiva semanal", categoria: "metacognicao" as const, paraQue: "Revisar stacks, eficácia e humor da semana", quandoUsar: "Domingo ou segunda", tempoTipico: 30, esforco: 2 },
];

function seed() {
  console.log("🌱 Seeding Polimata...");

  const [{ value: metodosCount }] = db.select({ value: count() }).from(metodos).all();
  if (metodosCount === 0) {
    db.insert(metodos).values(METODOS_SEED).run();
    console.log(`✅ ${METODOS_SEED.length} métodos inseridos`);
  } else {
    console.log(`ℹ️  Métodos já existem (${metodosCount})`);
  }

  const [{ value: fontesCount }] = db.select({ value: count() }).from(fontes).all();
  if (fontesCount === 0) {
    const createdFontes = db
      .insert(fontes)
      .values([
        {
          titulo: "Thinking, Fast and Slow",
          autor: "Daniel Kahneman",
          tipo: "livro",
          tema: "Psicologia cognitiva",
          status: "capturado",
          conteudoBruto:
            "Sistema 1 opera automaticamente e rapidamente, com pouco ou nenhum esforço e sem senso de controle voluntário. Sistema 2 aloca atenção às atividades mentais esforçadas que a demandam...",
        },
        {
          titulo: "Make It Stick",
          autor: "Brown, Roediger, McDaniel",
          tipo: "livro",
          tema: "Ciência da aprendizagem",
          status: "triado",
          conteudoBruto:
            "Aprendizagem que é fácil é como escrever na areia: aqui hoje e amanhã já foi. A aprendizagem dura requer esforço.",
        },
        {
          titulo: "How to Take Smart Notes",
          autor: "Sönke Ahrens",
          tipo: "livro",
          tema: "Zettelkasten / Notas",
          status: "processado",
          conteudoBruto:
            "Uma boa nota não é uma coleção de citações. É um pensamento próprio, escrito de forma que possa ser reutilizado em contextos futuros.",
        },
      ])
      .returning()
      .all();

    console.log(`✅ ${createdFontes.length} fontes exemplo inseridas`);

    const createdNotas = db
      .insert(notas)
      .values([
        {
          fonteId: createdFontes[0]?.id,
          titulo: "Sistema 1 vs Sistema 2",
          tipo: "conceitual",
          status: "processado",
          tags: ["kahneman", "dual-process"],
        },
        {
          titulo: "Retrieval practice supera releitura",
          tipo: "factual",
          status: "testado",
          tags: ["make-it-stick", "active-recall"],
        },
        {
          titulo: "Nota permanente vs literatura",
          tipo: "procedural",
          status: "capturado",
          tags: ["zettelkasten"],
        },
        {
          titulo: "Esforço desejável",
          tipo: "conceitual",
          status: "triado",
          tags: ["aprendizagem"],
        },
        {
          titulo: "Princípio da interleaving",
          tipo: "factual",
          status: "capturado",
          tags: ["prática"],
        },
      ])
      .returning()
      .all();

    if (createdNotas[0]) {
      db.insert(blocos)
        .values([
          {
            notaId: createdNotas[0].id,
            tipo: "paragrafo",
            conteudo:
              "Sistema 1 é rápido, automático e emocional. Sistema 2 é lento, deliberado e lógico. A maioria dos erros de julgamento vem de confiar demais no Sistema 1.",
            ordem: 0,
          },
        ])
        .run();
    }

    console.log(`✅ ${createdNotas.length} notas exemplo + blocos inseridos`);
  } else {
    console.log(`ℹ️  Fontes já existem (${fontesCount})`);
  }


  const [{ value: perguntasCount }] = db.select({ value: count() }).from(perguntas).all();
  if (perguntasCount === 0) {
    db.insert(perguntas)
      .values([
        {
          tipo: "basico",
          frente: "O que é o Sistema 1 segundo Kahneman?",
          verso: "Processo cognitivo rápido, automático, emocional e pouco esforçado.",
          estado: "novo",
          proximaRevisao: new Date(),
        },
        {
          tipo: "cloze",
          frente: "O {{c1::Sistema 2}} aloca atenção às atividades mentais esforçadas.",
          verso: "O Sistema 2 aloca atenção às atividades mentais esforçadas.",
          estado: "novo",
          proximaRevisao: new Date(),
        },
        {
          tipo: "basico",
          frente: "O que é retrieval practice?",
          verso: "Praticar a recuperação ativa da memória em vez de apenas releitura.",
          estado: "novo",
          proximaRevisao: new Date(),
        },
        {
          tipo: "cloze",
          frente: "A aprendizagem que é fácil é como escrever na {{c1::areia}}.",
          verso: "A aprendizagem que é fácil é como escrever na areia.",
          estado: "novo",
          proximaRevisao: new Date(),
        },
        {
          tipo: "basico",
          frente: "Qual o princípio central do Zettelkasten de Ahrens?",
          verso: "Notas permanentes são pensamentos próprios reutilizáveis, não coleções de citações.",
          estado: "novo",
          proximaRevisao: new Date(),
        },
      ])
      .run();
    console.log("✅ 5 perguntas FSRS de exemplo inseridas");
  }

  try {
    rebuildFtsIndex();
    console.log("✅ Índice FTS5 reconstruído");
  } catch (e) {
    console.warn("FTS rebuild skipped", e);
  }

  console.log("🎉 Seed concluído");
}

seed();
