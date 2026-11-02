/**
 * RSVP engine — pure logic, no React.
 * Chunks text and drives word-by-word playback timing.
 */

export type RsvpOptions = {
  /** words per minute */
  wpm: number;
  /** words shown at once (1–5) */
  chunkSize: number;
  /** pause multiplier on punctuation */
  punctuationPause: number;
};

export type RsvpChunk = {
  text: string;
  /** relative delay multiplier (1 = normal) */
  delayMul: number;
  isPunctuationEnd: boolean;
};

const PUNCT_END = /[.!?…]$/;
const PUNCT_SOFT = /[,;:]$/;

export function tokenize(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
}

export function buildChunks(
  words: string[],
  chunkSize: number
): RsvpChunk[] {
  const size = Math.max(1, Math.min(5, chunkSize));
  const chunks: RsvpChunk[] = [];
  for (let i = 0; i < words.length; i += size) {
    const slice = words.slice(i, i + size);
    const text = slice.join(" ");
    const last = slice[slice.length - 1] ?? "";
    let delayMul = 1;
    let isPunctuationEnd = false;
    if (PUNCT_END.test(last)) {
      delayMul = 2.2;
      isPunctuationEnd = true;
    } else if (PUNCT_SOFT.test(last)) {
      delayMul = 1.4;
    }
    // Highlight-ish: numbers / ALLCAPS get slight pause
    if (/\d/.test(text) || /^[A-ZÁÉÍÓÚÃÕÂÊÎÔÛ]{3,}$/.test(last)) {
      delayMul = Math.max(delayMul, 1.3);
    }
    chunks.push({ text, delayMul, isPunctuationEnd });
  }
  return chunks;
}

export function msPerChunk(wpm: number, delayMul: number, chunkSize: number): number {
  const base = (60_000 / Math.max(100, wpm)) * chunkSize;
  return Math.round(base * delayMul);
}

export function estimateDurationMs(
  wordCount: number,
  wpm: number
): number {
  return Math.round((wordCount / Math.max(100, wpm)) * 60_000);
}

/** 3-pass preview structure */
export function previewPasses(text: string): {
  titleLike: string;
  headings: string[];
  firstSentences: string;
  lastSentences: string;
} {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const titleLike = lines[0]?.slice(0, 120) ?? "";
  const headings = lines.filter((l) => l.length < 80 && !/[.!?]$/.test(l)).slice(0, 8);

  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  const firstSentences = sentences.slice(0, 3).join(" ");
  const lastSentences = sentences.slice(-2).join(" ");

  return { titleLike, headings, firstSentences, lastSentences };
}
