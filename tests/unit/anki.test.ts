import { describe, it, expect } from "vitest";
import { perguntasToAnkiTsv } from "../../src/lib/anki/csv";
import { simulateNewCardsLoad } from "../../src/lib/fsrs/simulate";

describe("anki tsv", () => {
  it("exports rows", () => {
    const tsv = perguntasToAnkiTsv([
      { frente: "Q?", verso: "A", tipo: "basico" },
    ]);
    expect(tsv).toContain("Q?");
    expect(tsv).toContain("A");
  });
});

describe("simulate load", () => {
  it("peaks above new cards", () => {
    const r = simulateNewCardsLoad({ newPerDay: 20, days: 30 });
    expect(r.peak).toBeGreaterThan(20);
    expect(r.points).toHaveLength(30);
  });
});
