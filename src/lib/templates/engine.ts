/** Template variables: {{date}}, {{title}}, {{fonte}}, {{time}} */
export function renderTemplate(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    return vars[key] ?? vars[key.toLowerCase()] ?? `{{${key}}}`;
  });
}

export const BUILTIN_TEMPLATES = [
  {
    id: "atomica",
    nome: "Nota atômica",
    body: `# {{title}}

## Ideia central


## Por que importa


## Conexões
- 

---
tags: atomic
data: {{date}}
`,
  },
  {
    id: "fonte",
    nome: "Resumo de fonte",
    body: `# {{title}}

**Fonte:** {{fonte}}
**Data:** {{date}}

## Resumo em 3 frases


## Citações


## Perguntas em aberto

`,
  },
  {
    id: "sessao",
    nome: "Sessão de estudo",
    body: `# Sessão {{date}}

**Objetivo:**
**Método:**
**Duração planejada:**

## Notas


## O que funcionou


## Próximo passo

`,
  },
  {
    id: "feynman",
    nome: "Feynman",
    body: `# {{title}} — Feynman

## Explicação simples (como para uma criança)


## Analogias


## Lacunas descobertas


data: {{date}}
`,
  },
];
