"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SlashCommand } from "./slash-command";
import { WikiLink, linkifyWikiSyntax } from "./wiki-link";
import { WikiAutocomplete } from "./wiki-autocomplete";

type Props = {
  initialContent?: string;
  onSave?: (html: string, plain: string) => void;
  editable?: boolean;
  className?: string;
};

type Suggestion = { id: string; title: string };

export function BlockEditor({
  initialContent = "",
  onSave,
  editable = true,
  className,
}: Props) {
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [wikiQ, setWikiQ] = useState<string | null>(null);
  const [wikiRange, setWikiRange] = useState<{ from: number; to: number } | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const rangeRef = useRef<{ from: number; to: number } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: "Escreva… / comandos · [[ wiki-links com autocomplete",
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-600 underline" },
      }),
      SlashCommand,
      WikiLink,
      WikiAutocomplete.configure({
        onQuery: (q, from, to) => {
          setWikiQ(q);
          setWikiRange({ from, to });
          rangeRef.current = { from, to };
        },
      }),
    ],
    content: initialContent || "",
    editable,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-[220px] focus:outline-none px-1",
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (!onSave) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        const html = linkifyWikiSyntax(ed.getHTML());
        onSave(html, ed.getText());
      }, 500);
    },
  });

  useEffect(() => {
    if (wikiQ === null) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/busca?q=${encodeURIComponent(wikiQ || "a")}`
        );
        const json = await res.json();
        const hits = (json.data ?? [])
          .filter((h: { objeto_tipo: string }) => h.objeto_tipo === "nota")
          .slice(0, 8)
          .map((h: { objeto_id: string; titulo: string }) => ({
            id: h.objeto_id,
            title: h.titulo,
          }));
        // fallback: also list from /api/notas if search empty
        if (hits.length === 0) {
          const r2 = await fetch("/api/notas");
          const j2 = await r2.json();
          const all = (j2.data ?? [])
            .filter((n: { titulo?: string }) =>
              (n.titulo ?? "")
                .toLowerCase()
                .includes((wikiQ ?? "").toLowerCase())
            )
            .slice(0, 8)
            .map((n: { id: string; titulo: string }) => ({
              id: n.id,
              title: n.titulo,
            }));
          setSuggestions(all);
        } else setSuggestions(hits);
      } catch {
        setSuggestions([]);
      }
    }, 150);
    return () => clearTimeout(t);
  }, [wikiQ]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  function pickWiki(title: string) {
    if (!editor || !rangeRef.current) return;
    const { from, to } = rangeRef.current;
    editor
      .chain()
      .focus()
      .deleteRange({ from, to })
      .insertContent(`[[${title}]]`)
      .run();
    setWikiQ(null);
    setSuggestions([]);
  }

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("URL", prev);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        "relative rounded-lg border border-slate-200 dark:border-slate-800",
        className
      )}
    >
      {editable && (
        <div className="flex flex-wrap gap-1 border-b border-slate-200 p-2 dark:border-slate-800">
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
          >
            <Bold className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
          >
            <Italic className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            active={editor.isActive("heading", { level: 2 })}
          >
            <Heading2 className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
          >
            <List className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
          >
            <Quote className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
          >
            <Code className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn onClick={setLink}>link</ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().undo().run()}>
            <Undo className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().redo().run()}>
            <Redo className="h-3.5 w-3.5" />
          </ToolbarBtn>
        </div>
      )}

      <div className="relative p-3">
        <EditorContent editor={editor} />
        {wikiQ !== null && suggestions.length > 0 && (
          <ul className="absolute left-3 top-8 z-20 max-h-48 w-64 overflow-auto rounded-md border border-slate-200 bg-white py-1 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-900">
            {suggestions.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className="w-full px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pickWiki(s.title);
                  }}
                >
                  [[{s.title}]]
                </button>
              </li>
            ))}
          </ul>
        )}
        {wikiQ !== null && suggestions.length === 0 && wikiQ.length > 0 && (
          <div className="absolute left-3 top-8 z-20 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-400 shadow dark:border-slate-700 dark:bg-slate-900">
            Nenhuma nota para “{wikiQ}” — Enter cria texto livre
          </div>
        )}
      </div>
    </div>
  );
}

function ToolbarBtn({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
        active && "bg-slate-200 dark:bg-slate-700"
      )}
    >
      {children}
    </button>
  );
}
