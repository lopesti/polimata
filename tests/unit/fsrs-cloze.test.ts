import { describe, it, expect } from "vitest";
import { parseCloze, clozeAnswer } from "../../src/lib/fsrs/scheduler";

describe("cloze parsing", () => {
  it("parses single cloze", () => {
    const { display, answers } = parseCloze(
      "O {{c1::Sistema 1}} é rápido."
    );
    expect(display).toBe("O ____ é rápido.");
    expect(answers).toEqual(["Sistema 1"]);
  });

  it("parses multiple clozes", () => {
    const { answers } = parseCloze(
      "{{c1::A}} e {{c2::B}}"
    );
    expect(answers).toEqual(["A", "B"]);
  });

  it("clozeAnswer reveals text", () => {
    expect(clozeAnswer("X {{c1::Y}} Z")).toBe("X Y Z");
  });
});
