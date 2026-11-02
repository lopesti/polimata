/**
 * Mini query language estilo Dataview (MVP).
 *
 * Exemplos:
 *   LIST notas
 *   LIST notas WHERE tipo = "conceitual"
 *   LIST notas WHERE status = "dominado"
 *   TABLE metodos WHERE eficacia > 3
 *   LIST fontes WHERE tipo = "livro"
 *   COUNT perguntas WHERE estado = "novo"
 */

export type QueryResult = {
  type: "list" | "table" | "count" | "error";
  entity?: string;
  columns?: string[];
  rows?: Record<string, unknown>[];
  count?: number;
  message?: string;
};

const ENTITIES = ["notas", "fontes", "metodos", "perguntas", "stacks", "sessoes"] as const;

export function parseQuery(input: string): {
  action: "LIST" | "TABLE" | "COUNT";
  entity: string;
  where?: { field: string; op: "=" | ">" | "<"; value: string | number };
} | { error: string } {
  const q = input.trim().replace(/\s+/g, " ");
  const m = q.match(/^(LIST|TABLE|COUNT)\s+(\w+)(?:\s+WHERE\s+(\w+)\s*(=|>|<)\s*("([^"]*)"|([\d.]+)|(\w+)))?$/i);
  if (!m) {
    return {
      error:
        'Sintaxe: LIST|TABLE|COUNT <entidade> [WHERE campo = valor]\nEx: LIST notas WHERE tipo = "conceitual"',
    };
  }
  const action = m[1]!.toUpperCase() as "LIST" | "TABLE" | "COUNT";
  const entity = m[2]!.toLowerCase();
  if (!ENTITIES.includes(entity as (typeof ENTITIES)[number])) {
    return { error: `Entidade inválida. Use: ${ENTITIES.join(", ")}` };
  }
  let where: { field: string; op: "=" | ">" | "<"; value: string | number } | undefined;
  if (m[3]) {
    const raw = m[5] ?? m[6] ?? m[7] ?? "";
    const num = Number(raw);
    where = {
      field: m[3],
      op: m[4] as "=" | ">" | "<",
      value: m[6] !== undefined && !Number.isNaN(num) ? num : raw,
    };
  }
  return { action, entity, where };
}

export function applyWhere(
  rows: Record<string, unknown>[],
  where?: { field: string; op: "=" | ">" | "<"; value: string | number }
): Record<string, unknown>[] {
  if (!where) return rows;
  return rows.filter((r) => {
    const v = r[where.field] ?? r[camel(where.field)] ?? r[snake(where.field)];
    if (where.op === "=") return String(v) === String(where.value);
    if (where.op === ">") return Number(v) > Number(where.value);
    if (where.op === "<") return Number(v) < Number(where.value);
    return false;
  });
}

function camel(s: string) {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}
function snake(s: string) {
  return s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}
