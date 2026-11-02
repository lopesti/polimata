import Link from "next/link";
import { db } from "@/lib/db/client";
import {
  fontes,
  notas,
  perguntas,
  metodos,
  stacks,
  sessoes,
} from "@/lib/db/schema";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  FileText,
  Brain,
  Layers,
  BookMarked,
  ArrowRight,
  LineChart,
  Inbox,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const nFontes = db.select().from(fontes).all().length;
  const nNotas = db.select().from(notas).all().length;
  const cards = db.select().from(perguntas).all();
  const nMetodos = db.select().from(metodos).all().length;
  const nStacks = db.select().from(stacks).all().length;
  const nSessoes = db.select().from(sessoes).all().length;

  const now = new Date();
  const due = cards.filter(
    (p) =>
      p.estado === "novo" ||
      !p.proximaRevisao ||
      p.proximaRevisao <= now
  ).length;

  const stats = [
    { label: "Fontes", value: nFontes, href: "/fontes", icon: BookOpen },
    { label: "Notas", value: nNotas, href: "/notas", icon: FileText },
    { label: "Due hoje", value: due, href: "/revisao", icon: Brain },
    { label: "Métodos", value: nMetodos, href: "/metodos", icon: Layers },
  ];

  const flows = [
    {
      title: "Capturar → Ler",
      desc: "Fonte com conteúdo bruto + RSVP / TTS",
      href: "/leitor",
      icon: BookMarked,
    },
    {
      title: "Revisar com FSRS",
      desc: `${due} card${due === 1 ? "" : "s"} na fila`,
      href: "/revisao",
      icon: Brain,
    },
    {
      title: "Stats de memória",
      desc: "Retenção, forecast e dispersão D×S",
      href: "/revisao/dashboard",
      icon: LineChart,
    },
    {
      title: "Inbox rápido",
      desc: "Daily notes e captura sem fricção",
      href: "/inbox",
      icon: Inbox,
    },
  ];

  return (
    <div className="p-8">
      <PageHeader
        eyebrow="Polimata"
        title="Orquestra de métodos"
        description="Leitura, notas, revisão espaçada e metacognição num sistema local-first. Método é ferramenta — combine o que funciona para você."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href}>
              <Card className="transition hover:border-slate-400 dark:hover:border-slate-600">
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-1">
                  <CardDescription>{s.label}</CardDescription>
                  <Icon className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold tabular-nums tracking-tight">
                    {s.value}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <h2 className="mb-3 mt-10 text-sm font-semibold uppercase tracking-wider text-slate-400">
        Comece por aqui
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {flows.map((f) => {
          const Icon = f.icon;
          return (
            <Link key={f.href} href={f.href}>
              <Card className="group h-full transition hover:border-slate-400 dark:hover:border-slate-600">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900">
                        <Icon className="h-4 w-4" />
                      </div>
                      <CardTitle>{f.title}</CardTitle>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
                  </div>
                  <CardDescription className="mt-2">{f.desc}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Stacks ativos</CardTitle>
            <CardDescription>{nStacks} stacks no banco</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sessões registradas</CardTitle>
            <CardDescription>{nSessoes} no histórico</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Atalhos</CardTitle>
            <CardDescription>
              ⌘K busca · ⌘P comandos · Revisão 1–4
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
