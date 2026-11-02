import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { stacks, stackMetodos } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  nome: z.string().min(1).max(300),
  objetivo: z.enum(["compreender", "memorizar", "aplicar", "ensinar", "criar"]),
  modo: z.enum(["livre", "sugerido", "automatico"]).optional(),
  fonteId: z.string().uuid().optional().nullable(),
  notaId: z.string().uuid().optional().nullable(),
  metodoIds: z.array(z.string().uuid()).optional(),
});

export async function GET() {
  try {
    const rows = db.select().from(stacks).orderBy(desc(stacks.criadoEm)).all();
    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error("[GET /api/stacks]", error);
    return NextResponse.json({ error: "Falha ao listar stacks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { metodoIds, ...rest } = parsed.data;
    const [created] = db
      .insert(stacks)
      .values({
        nome: rest.nome,
        objetivo: rest.objetivo,
        modo: rest.modo ?? "sugerido",
        fonteId: rest.fonteId || null,
        notaId: rest.notaId || null,
      })
      .returning()
      .all();

    if (metodoIds?.length && created) {
      db.insert(stackMetodos)
        .values(
          metodoIds.map((metodoId, ordem) => ({
            stackId: created.id,
            metodoId,
            ordem,
          }))
        )
        .run();
    }

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/stacks]", error);
    return NextResponse.json({ error: "Falha ao criar stack" }, { status: 500 });
  }
}
