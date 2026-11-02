import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { perguntas } from "@/lib/db/schema";
import { desc, eq, lte, or, isNull, and } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  notaId: z.string().uuid().optional().nullable(),
  blocoId: z.string().uuid().optional().nullable(),
  tipo: z.enum(["basico", "cloze", "image_occlusion", "multipla_escolha"]),
  frente: z.string().min(1),
  verso: z.string().min(1),
});

export async function GET(req: NextRequest) {
  try {
    const due = req.nextUrl.searchParams.get("due") === "1";
    const now = new Date();

    if (due) {
      // Cards due for review: new OR proxima_revisao <= now
      const rows = db
        .select()
        .from(perguntas)
        .where(
          or(
            eq(perguntas.estado, "novo"),
            and(
              isNull(perguntas.proximaRevisao),
              eq(perguntas.estado, "novo")
            ),
            lte(perguntas.proximaRevisao, now)
          )
        )
        .orderBy(perguntas.proximaRevisao)
        .all();

      // Also include pure "novo" that might not match lte
      const novos = db
        .select()
        .from(perguntas)
        .where(eq(perguntas.estado, "novo"))
        .all();

      const map = new Map<string, (typeof rows)[0]>();
      for (const r of [...rows, ...novos]) {
        if (
          r.estado === "novo" ||
          !r.proximaRevisao ||
          r.proximaRevisao <= now
        ) {
          map.set(r.id, r);
        }
      }
      return NextResponse.json({ data: Array.from(map.values()) });
    }

    const rows = db.select().from(perguntas).orderBy(desc(perguntas.criadoEm)).all();
    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error("[GET /api/perguntas]", error);
    return NextResponse.json({ error: "Falha ao listar perguntas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const [created] = db
      .insert(perguntas)
      .values({
        notaId: parsed.data.notaId || null,
        blocoId: parsed.data.blocoId || null,
        tipo: parsed.data.tipo,
        frente: parsed.data.frente,
        verso: parsed.data.verso,
        estado: "novo",
        proximaRevisao: new Date(),
      })
      .returning()
      .all();

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/perguntas]", error);
    return NextResponse.json({ error: "Falha ao criar pergunta" }, { status: 500 });
  }
}
