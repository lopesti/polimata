/**
 * PDF text extraction.
 * Prefer pdf-parse when installed; fallback message otherwise.
 */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    // dynamic import
    const pdfParse = (await import("pdf-parse")).default as (
      b: Buffer
    ) => Promise<{ text: string }>;
    const data = await pdfParse(buffer);
    return (data.text || "").trim();
  } catch (e) {
    throw new Error(
      `PDF parse indisponível: ${String(e)}. Instale pdf-parse ou cole o texto manualmente.`
    );
  }
}
