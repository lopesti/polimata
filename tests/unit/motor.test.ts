import { describe, it, expect } from "vitest";
import { sugerirStack, atualizarEficacia } from "../../src/lib/motor/regras";

describe("motor de sugestão", () => {
  it("sugere stack para conceitual + compreender", () => {
    const s = sugerirStack({ tipo: "conceitual", objetivo: "compreender" });
    expect(s.metodos.length).toBeGreaterThan(0);
    expect(s.justificativa).toContain("conceitual");
  });

  it("prazo curto reforça memória", () => {
    const s = sugerirStack({
      tipo: "factual",
      objetivo: "memorizar",
      prazoDias: 3,
    });
    const nomes = s.metodos.map((m) => m.nome.toLowerCase());
    expect(
      nomes.some((n) => n.includes("fsrs") || n.includes("flash") || n.includes("cloze"))
    ).toBe(true);
  });

  it("atualiza eficácia com média ponderada", () => {
    const next = atualizarEficacia(3, 8, 2, 3);
    expect(next).toBeGreaterThanOrEqual(1);
    expect(next).toBeLessThanOrEqual(5);
  });
});
