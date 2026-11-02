import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { metodos } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = db
      .select()
      .from(metodos)
      .orderBy(asc(metodos.categoria), asc(metodos.nome))
      .all();
    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error("[GET /api/metodos]", error);
    return NextResponse.json({ error: "Falha ao listar métodos" }, { status: 500 });
  }
}
