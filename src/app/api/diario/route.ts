import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { diarioMetacognitivo } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  oQueFuncionou: z.string().optional(),
  oQueAjustar: z.string().optional(),
  metodosTestados: z.array(z.string()).optional(),
  humor: z.number().int().min(1).max(5).optional(),
});

export async function GET() {
  try {
    const rows = db
      .select()
      .from(diarioMetacognitivo)
      .orderBy(desc(diarioMetacognitivo.data))
      .limit(30)
      .all();
    return NextResponse.json({ data: rows });
  } catch {
    return NextResponse.json({ error: "Falha" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const [created] = db
      .insert(diarioMetacognitivo)
      .values({
        oQueFuncionou: parsed.data.oQueFuncionou ?? null,
        oQueAjustar: parsed.data.oQueAjustar ?? null,
        metodosTestados: parsed.data.metodosTestados ?? [],
        humor: parsed.data.humor ?? null,
      })
      .returning()
      .all();
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Falha" }, { status: 500 });
  }
}
