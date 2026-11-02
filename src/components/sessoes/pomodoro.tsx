"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function Pomodoro({
  onComplete,
}: {
  onComplete?: (minutes: number) => void;
}) {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setRunning(false);
          if (mode === "focus") onComplete?.(25);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, mode, onComplete]);

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  function startFocus() {
    setMode("focus");
    setSeconds(25 * 60);
    setRunning(true);
  }
  function startBreak() {
    setMode("break");
    setSeconds(5 * 60);
    setRunning(true);
  }

  return (
    <div className="rounded-lg border border-slate-200 p-4 text-center dark:border-slate-800">
      <p className="text-xs uppercase text-slate-400">
        {mode === "focus" ? "Foco" : "Pausa"}
      </p>
      <p className="mt-2 font-mono text-4xl tabular-nums">
        {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
      </p>
      <div className="mt-3 flex justify-center gap-2">
        {!running ? (
          <>
            <Button size="sm" onClick={startFocus}>
              25 min
            </Button>
            <Button size="sm" variant="outline" onClick={startBreak}>
              5 min
            </Button>
          </>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => setRunning(false)}>
            Pausar
          </Button>
        )}
      </div>
    </div>
  );
}
