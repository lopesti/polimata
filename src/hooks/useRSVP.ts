"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildChunks,
  msPerChunk,
  tokenize,
  type RsvpChunk,
} from "@/lib/rsvp/engine";

export function useRSVP(text: string) {
  const [wpm, setWpm] = useState(400);
  const [chunkSize, setChunkSize] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const [chunks, setChunks] = useState<RsvpChunk[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const words = tokenize(text);
    setChunks(buildChunks(words, chunkSize));
    setIndex(0);
    setPlaying(false);
  }, [text, chunkSize]);

  const clear = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const tick = useCallback(
    (from: number, list: RsvpChunk[], speed: number) => {
      if (from >= list.length) {
        setPlaying(false);
        return;
      }
      setIndex(from);
      const chunk = list[from]!;
      const ms = msPerChunk(speed, chunk.delayMul, Math.max(1, chunk.text.split(" ").length));
      timer.current = setTimeout(() => tick(from + 1, list, speed), ms);
    },
    []
  );

  const play = useCallback(() => {
    clear();
    setPlaying(true);
    const start = index >= chunks.length - 1 ? 0 : index;
    tick(start, chunks, wpm);
  }, [chunks, index, tick, wpm]);

  const pause = useCallback(() => {
    clear();
    setPlaying(false);
  }, []);

  const reset = useCallback(() => {
    clear();
    setPlaying(false);
    setIndex(0);
  }, []);

  const seek = useCallback(
    (i: number) => {
      clear();
      setIndex(Math.max(0, Math.min(chunks.length - 1, i)));
      setPlaying(false);
    },
    [chunks.length]
  );

  useEffect(() => () => clear(), []);

  // Restart timing when wpm changes while playing
  useEffect(() => {
    if (!playing) return;
    clear();
    tick(index, chunks, wpm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wpm]);

  const current = chunks[index]?.text ?? "";
  const progress = chunks.length ? index / chunks.length : 0;
  const wordCount = tokenize(text).length;

  return {
    current,
    index,
    chunks,
    playing,
    wpm,
    setWpm,
    chunkSize,
    setChunkSize,
    play,
    pause,
    reset,
    seek,
    progress,
    wordCount,
  };
}
