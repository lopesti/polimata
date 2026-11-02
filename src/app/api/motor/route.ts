import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sugerirStack } from "@/lib/motor/regras";
import { db } from "@/lib/db/client";
import { metodos, stacks, stackMetodos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const schema = z.object({
  tipo: z.enum(["factual", "conceitual", "procedural", "abstrato", "misto"]),
  objetivo: z.enum(["compreender", "memorizar", "aplicar", "ensinar", "criar"]),
  titulo: z.string().optional(),
  prazoDias: z.number().int().positive().optional(),
  aplicar: z.boolean().optional(), // se true, cria stack no banco
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const sugestao = sugerirStack(parsed.data);

    // Resolve nomes → ids de métodos existentes
    const todos = db.select().from(metodos).all();
    const resolved = sugestao.metodos.map((m) => {
      const found = todos.find(
        (t) => t.nome.toLowerCase() === m.nome.toLowerCase()
      );
      return { ...m, metodoId: found?.id ?? null };
    });

    let stackId: string | null = null;
    if (parsed.data.aplicar) {
      const [created] = db
        .insert(stacks)
        .values({
          nome: sugestao.nome,
          objetivo: sugestao.objetivo,
          modo: "sugerido",
          status: "ativo",
        })
        .returning()
        .all();
      stackId = created?.id ?? null;
      if (created) {
        const withIds = resolved.filter((r) => r.metodoId);
        if (withIds.length) {
          db.insert(stackMetodos)
            .values(
              withIds.map((r, ordem) => ({
                stackId: created.id,
                metodoId: r.metodoId!,
                ordem,
              }))
            )
            .run();
        }
      }
    }

    return NextResponse.json({
      data: { ...sugestao, metodos: resolved, stackId },
    });
  } catch (error) {
    console.error("[POST /api/motor]", error);
    return NextResponse.json({ error: "Falha no motor" }, { status: 500 });
  }
}
