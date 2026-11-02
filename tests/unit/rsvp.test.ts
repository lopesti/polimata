import { describe, it, expect } from "vitest";
import {
  tokenize,
  buildChunks,
  msPerChunk,
  estimateDurationMs,
  previewPasses,
} from "../../src/lib/rsvp/engine";

describe("RSVP engine", () => {
  it("tokenizes words", () => {
    expect(tokenize("  olá   mundo  ")).toEqual(["olá", "mundo"]);
  });

  it("builds chunks with punctuation pause", () => {
    const words = tokenize("Um dois. Três");
    const chunks = buildChunks(words, 1);
    expect(chunks.length).toBe(3);
    expect(chunks[1]!.delayMul).toBeGreaterThan(1);
    expect(chunks[1]!.isPunctuationEnd).toBe(true);
  });

  it("respects chunk size", () => {
    const words = tokenize("a b c d e f");
    expect(buildChunks(words, 2)).toHaveLength(3);
  });

  it("estimates duration", () => {
    // 400 words at 400 wpm = 60s
    expect(estimateDurationMs(400, 400)).toBe(60_000);
  });

  it("preview passes extracts structure", () => {
    const text = "Título\n\nIntrodução curta. Segunda frase. Terceira.\n\nConclusão final.";
    const p = previewPasses(text);
    expect(p.titleLike).toContain("Título");
    expect(p.firstSentences.length).toBeGreaterThan(0);
  });

  it("msPerChunk scales with wpm", () => {
    const slow = msPerChunk(200, 1, 1);
    const fast = msPerChunk(800, 1, 1);
    expect(slow).toBeGreaterThan(fast);
  });
});
