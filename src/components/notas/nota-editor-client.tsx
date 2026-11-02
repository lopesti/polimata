"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { BlockEditor, htmlToSimpleBlocks } from "@/components/editor/block-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Check, Download } from "lucide-react";
import { TtsPlayer } from "@/components/leitor/tts-player";
import { CreateCardForm } from "@/components/revisao/create-card-form";
import { BacklinksPanel } from "@/components/notas/backlinks-panel";

type Bloco = {
  id: string;
  tipo: string;
  conteudo: string;
  ordem: number;
};

type Nota = {
  id: string;
  titulo: string | null;
  tipo: string;
  status: string | null;
  tags: string[] | null;
  blocos: Bloco[];
};

export function NotaEditorClient({ nota }: { nota: Nota }) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(nota.titulo ?? "");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [deleting, setDeleting] = useState(false);

  const initialHtml =
    nota.blocos.length > 0
      ? nota.blocos
          .sort((a, b) => a.ordem - b.ordem)
          .map((b) => b.conteudo)
          .join("")
      : "";

  const handleSaveContent = useCallback(
    async (html: string) => {
      setSaveState("saving");
      try {
        const blocks = htmlToSimpleBlocks(html);
        const res = await fetch("/api/blocos", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notaId: nota.id,
            blocos: blocks.map((b, i) => ({
              ...b,
              ordem: i,
            })),
          }),
        });
        if (!res.ok) throw new Error("fail");
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 1500);
      } catch {
        setSaveState("error");
      }
    },
    [nota.id]
  );

  async function saveTitulo() {
    setSaveState("saving");
    try {
      const res = await fetch(`/api/notas/${nota.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: titulo || null }),
      });
      if (!res.ok) throw new Error("fail");
      setSaveState("saved");
      router.refresh();
      setTimeout(() => setSaveState("idle"), 1500);
    } catch {
      setSaveState("error");
    }
  }

  async function handleDelete() {
    if (!confirm("Deletar esta nota e todos os blocos?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/notas/${nota.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/notas");
        router.refresh();
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-4 flex items-center justify-between">
        <a href="/notas" className="text-sm text-slate-500 hover:underline">
          ← Notas
        </a>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {saveState === "saving" && "Salvando…"}
            {saveState === "saved" && (
              <span className="flex items-center gap-1 text-emerald-600">
                <Check className="h-3 w-3" /> Salvo
              </span>
            )}
            {saveState === "error" && <span className="text-red-600">Erro ao salvar</span>}
          </span>
          <a href={`/api/notas/${nota.id}/markdown`}>
            <Button variant="outline" size="sm" type="button">
              <Download className="mr-1 h-3.5 w-3.5" />
              .md
            </Button>
          </a>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            Deletar
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Badge variant="outline">{nota.tipo}</Badge>
        <Badge variant="secondary">{nota.status}</Badge>
        {(nota.tags ?? []).map((t) => (
          <Badge key={t} variant="secondary">
            #{t}
          </Badge>
        ))}
      </div>

      <div className="mb-4 flex gap-2">
        <Input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          onBlur={saveTitulo}
          placeholder="Título da nota"
          className="text-lg font-semibold"
        />
      </div>

      <BlockEditor initialContent={initialHtml} onSave={handleSaveContent} />

      <div className="mt-8">
        <h3 className="mb-2 text-sm font-semibold uppercase text-slate-400">
          Criar flashcard
        </h3>
        <CreateCardForm notaId={nota.id} />
      </div>

      <div className="mt-8">
        <BacklinksPanel notaId={nota.id} />
      </div>

      <div className="mt-4">
        <TtsPlayer
          text={
            (titulo ? titulo + ". " : "") +
            nota.blocos.map((b) => b.conteudo.replace(/<[^>]+>/g, " ")).join(" ")
          }
          label="Ouvir nota"
        />
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Autosave a cada 500ms · conteúdo armazenado como blocos
      </p>
    </div>
  );
}
