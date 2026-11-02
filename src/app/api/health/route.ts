import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    db.get(sql`SELECT 1`);
    return NextResponse.json({
      ok: true,
      service: "polimata",
      version: "0.10.0",
      db: "sqlite",
      ts: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 503 }
    );
  }
}
