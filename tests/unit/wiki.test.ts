import { describe, it, expect } from "vitest";
import { extractWikiTitles, normalizeTitle } from "../../src/lib/links/wiki";

describe("wiki links", () => {
  it("extracts titles", () => {
    expect(extractWikiTitles("Ver [[Sistema 1]] e [[Sistema 2]].")).toEqual([
      "Sistema 1",
      "Sistema 2",
    ]);
  });

  it("normalizes", () => {
    expect(normalizeTitle("  Abc ")).toBe("abc");
  });
});
