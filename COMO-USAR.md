# Polimata v0.12 — Como usar

## Quick start

```bash
docker compose -f docker-compose.dev.yml up --build
# http://localhost:3000
```

```bash
npm install
npx playwright install chromium   # e2e
npm run db:push && npm run db:seed
npm run dev
npm test
npm run test:e2e                  # server sobe sozinho se livre
```

## O que entrou nesta rodada (últimas melhorias)

| Feature | Onde |
|---------|------|
| Playwright e2e | `tests/e2e/app.spec.ts` |
| Migrations baseline | `drizzle/migrations/` |
| Wiki autocomplete `[[` | Editor de notas |
| Canvas arrastável | `/canvas` |
| Grafo Cytoscape | `/grafo` (npm i cytoscape) |
| Export Anki TSV | `/api/anki/export` + Config |
| Import PDF → fonte | Config (pdf-parse) |
| Simulador de carga | `/revisao/dashboard` |
| Filas filtradas | `/revisao?tipo=cloze` |
| Error boundary | layout app |
| Plugin registry | `src/lib/plugins/registry.ts` |
| Tauri scaffold | `src-tauri/` |

## Exports

- JSON backup: `/api/export`
- Obsidian MD: `/api/export/obsidian`
- Anki TSV: `/api/anki/export` (File → Import no Anki)

## Desktop

Ver `src-tauri/README.md` (Rust + `npx tauri dev`).
