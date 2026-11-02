import { NextRequest, NextResponse } from "next/server";
import { searchFts, rebuildFtsIndex } from "@/lib/db/fts";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const rebuild = req.nextUrl.searchParams.get("rebuild") === "1";

  try {
    if (rebuild) {
      rebuildFtsIndex();
      return NextResponse.json({ data: { rebuilt: true } });
    }
    const hits = searchFts(q, 25);
    return NextResponse.json({ data: hits });
  } catch (error) {
    console.error("[GET /api/busca]", error);
    return NextResponse.json({ error: "Falha na busca" }, { status: 500 });
  }
}
