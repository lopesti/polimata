"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  isTtsSupported,
  listVoices,
  speakLong,
  type TtsHandle,
} from "@/lib/tts/web-speech";

export function useTTS() {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [rate, setRate] = useState(1.3);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [progress, setProgress] = useState({ i: 0, total: 0 });
  const handle = useRef<TtsHandle | null>(null);

  useEffect(() => {
    setSupported(isTtsSupported());
    const load = () => setVoices(listVoices());
    load();
    window.speechSynthesis?.addEventListener("voiceschanged", load);
    return () => {
      window.speechSynthesis?.removeEventListener("voiceschanged", load);
      handle.current?.stop();
    };
  }, []);

  const stop = useCallback(() => {
    handle.current?.stop();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string) => {
      stop();
      if (!text.trim()) return;
      setSpeaking(true);
      handle.current = speakLong(
        text,
        { rate, lang: "pt-BR" },
        (i, total) => setProgress({ i, total }),
        () => setSpeaking(false)
      );
    },
    [rate, stop]
  );

  return {
    supported,
    speaking,
    rate,
    setRate,
    voices,
    progress,
    speak,
    stop,
  };
}
