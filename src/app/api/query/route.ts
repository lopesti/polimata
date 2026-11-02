import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import {
  notas,
  fontes,
  metodos,
  perguntas,
  stacks,
  sessoes,
} from "@/lib/db/schema";
import { parseQuery, applyWhere, type QueryResult } from "@/lib/query/engine";

export const dynamic = "force-dynamic";

const loaders: Record<string, () => Record<string, unknown>[]> = {
  notas: () => db.select().from(notas).all() as unknown as Record<string, unknown>[],
  fontes: () => db.select().from(fontes).all() as unknown as Record<string, unknown>[],
  metodos: () => db.select().from(metodos).all() as unknown as Record<string, unknown>[],
  perguntas: () => db.select().from(perguntas).all() as unknown as Record<string, unknown>[],
  stacks: () => db.select().from(stacks).all() as unknown as Record<string, unknown>[],
  sessoes: () => db.select().from(sessoes).all() as unknown as Record<string, unknown>[],
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  try {
    const parsed = parseQuery(q);
    if ("error" in parsed) {
      return NextResponse.json({ data: { type: "error", message: parsed.error } satisfies QueryResult });
    }
    const rows = applyWhere(loaders[parsed.entity]!(), parsed.where);

    if (parsed.action === "COUNT") {
      return NextResponse.json({
        data: { type: "count", entity: parsed.entity, count: rows.length } satisfies QueryResult,
      });
    }

    const columns =
      rows[0] != null
        ? Object.keys(rows[0]).filter((k) => !["metadados", "conteudoBruto"].includes(k)).slice(0, 8)
        : [];

    return NextResponse.json({
      data: {
        type: parsed.action === "TABLE" ? "table" : "list",
        entity: parsed.entity,
        columns,
        rows: rows.slice(0, 100),
      } satisfies QueryResult,
    });
  } catch (error) {
    console.error("[query]", error);
    return NextResponse.json({ error: "Falha na query" }, { status: 500 });
  }
}
