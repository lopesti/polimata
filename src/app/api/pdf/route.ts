import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/http";
import { extractPdfText } from "@/lib/pdf/extract";
import { db } from "@/lib/db/client";
import { fontes } from "@/lib/db/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const title = String(form.get("title") || "PDF importado");
    if (!file || typeof file === "string") {
      return fail("Envie multipart field 'file'");
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const text = await extractPdfText(buf);
    const asFonte = form.get("asFonte") === "1" || form.get("asFonte") === "true";

    if (asFonte) {
      const [created] = db
        .insert(fontes)
        .values({
          titulo: title,
          tipo: "artigo",
          conteudoBruto: text.slice(0, 500_000),
          status: "capturado",
        })
        .returning()
        .all();
      return ok({ text: text.slice(0, 5000), fonte: created, chars: text.length }, 201);
    }

    return ok({ text, chars: text.length });
  } catch (error) {
    console.error("[pdf]", error);
    return fail(String(error), 500);
  }
}
