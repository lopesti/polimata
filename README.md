# 🧠 Polimata

> **Não um método. Uma orquestra.**

Sistema **local-first** de pesquisa, estudo e domínio — unindo o melhor de notas (Obsidian/Notion), revisão espaçada (FSRS/Anki), leitura acelerada (RSVP) e metacognição.

## Status

**MVP elite + P0–P2 + polish final (v0.12)** — pronto para demo e iteração local. Não é o produto final do prompt mestre; é uma base sólida, tipada e extensível.

| Camada | Tecnologia |
|--------|------------|
| App | Next.js 14 App Router · TypeScript |
| UI | Tailwind · componentes próprios |
| Dados | SQLite · Drizzle ORM · FTS5 |
| Memória | ts-fsrs (FSRS-5) |
| Editor | TipTap |
| Deploy | Docker multi-stage |

## Quick start

```bash
docker compose -f docker-compose.dev.yml up --build
# → http://localhost:3000
```

Local:

```bash
npm install
mkdir -p data
export DATABASE_URL=file:./data/polimata.db
npx drizzle-kit push
npx tsx src/lib/db/seed.ts
npm run dev
```

Detalhes: **[COMO-USAR.md](./COMO-USAR.md)**

## Mapa de módulos

1. Fundação (schema, Docker, FTS5, fontes)  
2. Notas + TipTap  
3. Leitor RSVP / TTS  
4. FSRS (fila + cloze)  
5. Motor de stacks + diário  
6. Grafo SVG + inbox  
7. Import JSON/MD + templates  
8. Query language + forecast  
9. Playlist + Ctrl+P + Pomodoro  
10. Dashboard de revisão (inclui dispersão D×S)

## Princípios (código)

- Local-first: dados no SQLite, volume Docker  
- Método é ferramenta, não dogma  
- Lógica de domínio em `src/lib/` (FSRS, RSVP, motor, query)  
- UI fina; APIs com `{ data, error }`  

## Atalhos

| Atalho | Ação |
|--------|------|
| ⌘/Ctrl+K | Busca full-text |
| ⌘/Ctrl+P | Command palette |
| Espaço / 1–4 | Revisão FSRS |

## Licença

Uso privado / estudo. Ajuste conforme necessário.
