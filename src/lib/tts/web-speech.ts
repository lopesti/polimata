/**
 * Web Speech API wrapper (MVP TTS).
 * Works offline in browsers that ship voices; prefers pt-BR.
 */

export type TtsOptions = {
  rate?: number; // 0.5–3
  pitch?: number;
  lang?: string;
  voiceURI?: string;
};

export function isTtsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function listVoices(): SpeechSynthesisVoice[] {
  if (!isTtsSupported()) return [];
  return window.speechSynthesis.getVoices();
}

export function pickPtBrVoice(): SpeechSynthesisVoice | null {
  const voices = listVoices();
  return (
    voices.find((v) => v.lang === "pt-BR") ??
    voices.find((v) => v.lang.startsWith("pt")) ??
    voices.find((v) => v.default) ??
    voices[0] ??
    null
  );
}

export type TtsHandle = {
  stop: () => void;
  pause: () => void;
  resume: () => void;
};

export function speak(
  text: string,
  opts: TtsOptions = {},
  onEnd?: () => void,
  onError?: (e: unknown) => void
): TtsHandle {
  if (!isTtsSupported()) {
    onError?.(new Error("Speech Synthesis não suportado"));
    return { stop: () => {}, pause: () => {}, resume: () => {} };
  }

  window.speechSynthesis.cancel();

  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = Math.min(3, Math.max(0.5, opts.rate ?? 1.2));
  utt.pitch = opts.pitch ?? 1;
  utt.lang = opts.lang ?? "pt-BR";

  const voice =
    (opts.voiceURI
      ? listVoices().find((v) => v.voiceURI === opts.voiceURI)
      : null) ?? pickPtBrVoice();
  if (voice) utt.voice = voice;

  utt.onend = () => onEnd?.();
  utt.onerror = (e) => onError?.(e);

  window.speechSynthesis.speak(utt);

  return {
    stop: () => window.speechSynthesis.cancel(),
    pause: () => window.speechSynthesis.pause(),
    resume: () => window.speechSynthesis.resume(),
  };
}

/** Split long text into utterances (~200 words) to avoid browser cuts */
export function speakLong(
  text: string,
  opts: TtsOptions = {},
  onProgress?: (i: number, total: number) => void,
  onEnd?: () => void
): TtsHandle {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += 180) {
    chunks.push(words.slice(i, i + 180).join(" "));
  }
  let idx = 0;
  let current: TtsHandle = { stop: () => {}, pause: () => {}, resume: () => {} };
  let stopped = false;

  const playNext = () => {
    if (stopped || idx >= chunks.length) {
      onEnd?.();
      return;
    }
    onProgress?.(idx, chunks.length);
    current = speak(chunks[idx]!, opts, () => {
      idx++;
      playNext();
    });
  };

  playNext();

  return {
    stop: () => {
      stopped = true;
      current.stop();
    },
    pause: () => current.pause(),
    resume: () => current.resume(),
  };
}
