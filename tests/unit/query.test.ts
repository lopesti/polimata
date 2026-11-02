import { describe, it, expect } from "vitest";
import { parseQuery, applyWhere } from "../../src/lib/query/engine";

describe("query language", () => {
  it("parses LIST with where", () => {
    const p = parseQuery('LIST notas WHERE tipo = "conceitual"');
    expect("error" in p).toBe(false);
    if (!("error" in p)) {
      expect(p.action).toBe("LIST");
      expect(p.entity).toBe("notas");
      expect(p.where?.field).toBe("tipo");
      expect(p.where?.value).toBe("conceitual");
    }
  });

  it("parses COUNT", () => {
    const p = parseQuery("COUNT perguntas");
    expect("error" in p).toBe(false);
  });

  it("filters rows", () => {
    const rows = applyWhere(
      [
        { tipo: "conceitual", status: "novo" },
        { tipo: "factual", status: "novo" },
      ],
      { field: "tipo", op: "=", value: "factual" }
    );
    expect(rows).toHaveLength(1);
  });
});
