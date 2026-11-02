import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, fail } from "@/lib/api/http";
import { simulateNewCardsLoad } from "@/lib/fsrs/simulate";

export const dynamic = "force-dynamic";

const schema = z.object({
  newPerDay: z.number().int().min(0).max(200).default(10),
  days: z.number().int().min(1).max(90).default(30),
});

export async function GET(req: NextRequest) {
  try {
    const newPerDay = Number(req.nextUrl.searchParams.get("newPerDay") ?? 10);
    const days = Number(req.nextUrl.searchParams.get("days") ?? 30);
    const parsed = schema.safeParse({ newPerDay, days });
    if (!parsed.success) return fail("Parâmetros inválidos", 400, parsed.error.flatten());
    return ok(simulateNewCardsLoad(parsed.data));
  } catch (e) {
    return fail(String(e), 500);
  }
}
