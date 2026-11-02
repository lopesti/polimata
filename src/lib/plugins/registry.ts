/**
 * Extension point for methods / future plugins.
 */

export type MethodPlugin = {
  id: string;
  nome: string;
  categoria: string;
  run?: (ctx: { notaId?: string; texto?: string }) => Promise<void> | void;
};

const plugins = new Map<string, MethodPlugin>();

export function registerMethodPlugin(p: MethodPlugin) {
  plugins.set(p.id, p);
}

export function listMethodPlugins() {
  return Array.from(plugins.values());
}

registerMethodPlugin({
  id: "feynman-prompt",
  nome: "Feynman Technique",
  categoria: "compreensao",
  run: () => {
    if (typeof window !== "undefined") window.location.href = "/notas/nova";
  },
});

registerMethodPlugin({
  id: "start-review",
  nome: "Spaced Repetition (FSRS)",
  categoria: "memoria",
  run: () => {
    if (typeof window !== "undefined") window.location.href = "/revisao";
  },
});
