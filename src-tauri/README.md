# Polimata Desktop (Tauri)

Scaffold apenas. Para gerar o app:

```bash
# na raiz do projeto
npm install
npm install -D @tauri-apps/cli
# precisa de Rust: https://rustup.rs
npx tauri init  # se quiser regenerar
npx tauri dev
```

O frontend continua sendo Next.js; Tauri embute a UI em janela nativa.
