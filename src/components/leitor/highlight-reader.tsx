"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Highlighter } from "lucide-react";

type Props = {
  text: string;
  onCreateNota?: (selection: string) => void;
};

const COLORS = [
  { id: "yellow", className: "bg-yellow-200 dark:bg-yellow-900/50" },
  { id: "green", className: "bg-emerald-200 dark:bg-emerald-900/50" },
  { id: "blue", className: "bg-sky-200 dark:bg-sky-900/50" },
  { id: "red", className: "bg-red-200 dark:bg-red-900/40" },
] as const;

export function HighlightReader({ text, onCreateNota }: Props) {
  const [selection, setSelection] = useState("");
  const [color, setColor] = useState<(typeof COLORS)[number]["id"]>("yellow");
  const [marks, setMarks] = useState<{ text: string; color: string }[]>([]);

  const captureSelection = useCallback(() => {
    const sel = window.getSelection()?.toString().trim() ?? "";
    setSelection(sel);
  }, []);

  function addHighlight() {
    if (!selection) return;
    setMarks((m) => [...m, { text: selection, color }]);
    setSelection("");
    window.getSelection()?.removeAllRanges();
  }

  function createNota() {
    if (!selection) return;
    onCreateNota?.(selection);
    setSelection("");
  }

  // Simple render: show text; highlights listed below (full inline mark-up is complex without ranges)
  return (
    <div>
      <div
        className="max-h-[28rem] overflow-y-auto rounded-lg border border-slate-200 bg-white p-5 text-sm leading-relaxed whitespace-pre-wrap dark:border-slate-800 dark:bg-slate-950"
        onMouseUp={captureSelection}
        onKeyUp={captureSelection}
      >
        {text}
      </div>

      {selection && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
          <span className="max-w-xs truncate text-xs text-slate-500">
            “{selection.slice(0, 80)}
            {selection.length > 80 ? "…" : ""}”
          </span>
          <div className="flex gap-1">
            {COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                title={c.id}
                onClick={() => setColor(c.id)}
                className={`h-5 w-5 rounded-full border-2 ${c.className} ${
                  color === c.id ? "border-slate-900 dark:border-white" : "border-transparent"
                }`}
              />
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={addHighlight}>
            <Highlighter className="mr-1 h-3.5 w-3.5" />
            Highlight
          </Button>
          {onCreateNota && (
            <Button size="sm" onClick={createNota}>
              Criar nota
            </Button>
          )}
        </div>
      )}

      {marks.length > 0 && (
        <ul className="mt-4 space-y-1">
          <p className="text-xs font-medium uppercase text-slate-400">
            Highlights ({marks.length})
          </p>
          {marks.map((m, i) => {
            const c = COLORS.find((x) => x.id === m.color);
            return (
              <li
                key={i}
                className={`rounded px-2 py-1 text-sm ${c?.className ?? ""}`}
              >
                {m.text}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
