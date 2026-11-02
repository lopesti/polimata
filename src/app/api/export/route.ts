import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import {
  fontes,
  notas,
  blocos,
  metodos,
  stacks,
  perguntas,
  sessoes,
} from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      fontes: db.select().from(fontes).all(),
      notas: db.select().from(notas).all(),
      blocos: db.select().from(blocos).all(),
      metodos: db.select().from(metodos).all(),
      stacks: db.select().from(stacks).all(),
      perguntas: db.select().from(perguntas).all(),
      sessoes: db.select().from(sessoes).all(),
    };

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="polimata-export-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error("[GET /api/export]", error);
    return NextResponse.json({ error: "Falha no export" }, { status: 500 });
  }
}
