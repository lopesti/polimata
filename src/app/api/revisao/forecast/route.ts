import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { perguntas } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const all = db.select().from(perguntas).all();
    const days: { date: string; count: number }[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const count = all.filter((p) => {
        if (i === 0 && (p.estado === "novo" || !p.proximaRevisao)) return true;
        if (!p.proximaRevisao) return false;
        const due = new Date(p.proximaRevisao);
        return due >= d && due < next;
      }).length;
      days.push({ date: d.toISOString().slice(0, 10), count });
    }

    return NextResponse.json({
      data: {
        days,
        totalCards: all.length,
        peak: Math.max(0, ...days.map((d) => d.count)),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Falha" }, { status: 500 });
  }
}
