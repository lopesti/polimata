"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BUILTIN_TEMPLATES } from "@/lib/templates/engine";
import { applyTheme } from "@/components/providers/theme-provider";

const STORAGE_KEY = "polimata-settings";

type Settings = {
  defaultWpm: number;
  defaultTtsRate: number;
  theme: "system" | "light" | "dark";
};

const defaults: Settings = {
  defaultWpm: 400,
  defaultTtsRate: 1.3,
  theme: "system",
};

export default function ConfigPage() {
  const [settings, setSettings] = useState<Settings>(defaults);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [md, setMd] = useState("");
  const [tplTitle, setTplTitle] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings({ ...defaults, ...JSON.parse(raw) });
    } catch {}
  }, []);

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    applyTheme(settings.theme);
    setImportStatus("Preferências salvas no navegador.");
  }

  async function importJsonFile(file: File) {
    const text = await file.text();
    const json = JSON.parse(text);
    const res = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(json),
    });
    const data = await res.json();
    setImportStatus(
      res.ok
        ? `Import OK: ${JSON.stringify(data.data?.inserted ?? data.data)}`
        : `Erro: ${data.error}`
    );
  }

  async function importMarkdown() {
    const res = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markdown: md }),
    });
    const data = await res.json();
    setImportStatus(
      res.ok ? `Nota criada: ${data.data?.nota?.titulo}` : `Erro: ${data.error}`
    );
    if (res.ok) setMd("");
  }

  async function applyTemplate(id: string) {
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId: id, title: tplTitle || undefined }),
    });
    const data = await res.json();
    if (res.ok) {
      setImportStatus(`Template aplicado → nota ${data.data?.id}`);
      window.location.href = `/notas/${data.data.id}`;
    } else setImportStatus("Falha no template");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10 p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="mt-1 text-sm text-slate-500">
          Preferências locais · import/export · templates
        </p>
      </div>

      <section className="space-y-3 rounded-lg border p-4 dark:border-slate-800">
        <h2 className="font-semibold">Preferências</h2>
        <label className="block text-sm">
          WPM padrão (RSVP)
          <Input
            type="number"
            value={settings.defaultWpm}
            onChange={(e) =>
              setSettings({ ...settings, defaultWpm: Number(e.target.value) })
            }
          />
        </label>
        <label className="block text-sm">
          Tema
          <select
            className="mt-1 flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-2 text-sm dark:border-slate-700"
            value={settings.theme}
            onChange={(e) => {
              const theme = e.target.value as Settings["theme"];
              setSettings({ ...settings, theme });
              applyTheme(theme);
            }}
          >
            <option value="system">Sistema</option>
            <option value="light">Claro</option>
            <option value="dark">Escuro</option>
          </select>
        </label>
        <label className="block text-sm">
          Velocidade TTS padrão
          <Input
            type="number"
            step={0.1}
            value={settings.defaultTtsRate}
            onChange={(e) =>
              setSettings({
                ...settings,
                defaultTtsRate: Number(e.target.value),
              })
            }
          />
        </label>
        <Button onClick={save}>Salvar preferências</Button>
      </section>

      <section className="space-y-3 rounded-lg border p-4 dark:border-slate-800">
        <h2 className="font-semibold">Import JSON (backup)</h2>
        <input
          type="file"
          accept="application/json,.json"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importJsonFile(f);
          }}
        />
        <p className="text-xs text-slate-400">
          Use o arquivo gerado em /api/export
        </p>
      </section>

      <section className="space-y-3 rounded-lg border p-4 dark:border-slate-800">
        <h2 className="font-semibold">Import Markdown</h2>
        <textarea
          className="min-h-[120px] w-full rounded-md border border-slate-200 bg-transparent p-2 font-mono text-xs dark:border-slate-700"
          placeholder={"---\ntitle: Minha nota\ntags: a, b\n---\n\n# Conteúdo"}
          value={md}
          onChange={(e) => setMd(e.target.value)}
        />
        <Button onClick={importMarkdown} disabled={!md.trim()}>
          Importar MD
        </Button>
      </section>

      <section className="space-y-3 rounded-lg border p-4 dark:border-slate-800">
        <h2 className="font-semibold">Templates</h2>
        <Input
          placeholder="Título da nota"
          value={tplTitle}
          onChange={(e) => setTplTitle(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {BUILTIN_TEMPLATES.map((t) => (
            <Button
              key={t.id}
              variant="outline"
              size="sm"
              onClick={() => applyTemplate(t.id)}
            >
              {t.nome}
            </Button>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-lg border p-4 dark:border-slate-800">
        <h2 className="font-semibold">Import PDF</h2>
        <input
          type="file"
          accept="application/pdf"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const fd = new FormData();
            fd.set("file", f);
            fd.set("title", f.name.replace(/\.pdf$/i, ""));
            fd.set("asFonte", "1");
            setImportStatus("Extraindo PDF…");
            try {
              const res = await fetch("/api/pdf", { method: "POST", body: fd });
              const data = await res.json();
              setImportStatus(
                res.ok
                  ? `PDF → fonte (${data.data?.chars ?? 0} chars)`
                  : `Erro PDF: ${data.error}`
              );
            } catch (err) {
              setImportStatus(String(err));
            }
          }}
        />
        <p className="text-xs text-slate-400">Requer pacote pdf-parse instalado</p>
      </section>

      <section className="space-y-2 rounded-lg border p-4 dark:border-slate-800">
        <h2 className="font-semibold">Export</h2>
        <div className="flex flex-wrap gap-2">
          <a href="/api/export">
            <Button variant="secondary">Backup JSON</Button>
          </a>
          <a href="/api/export/obsidian">
            <Button variant="outline">Export Obsidian (.md)</Button>
          </a>
          <a href="/api/anki/export">
            <Button variant="outline">Export Anki (TSV)</Button>
          </a>
        </div>
      </section>

      {importStatus && (
        <p className="text-sm text-slate-600 dark:text-slate-300">{importStatus}</p>
      )}

      <p className="text-xs text-slate-400">
        Atalhos: Ctrl+K busca · Ctrl+P comandos
      </p>
    </div>
  );
}
