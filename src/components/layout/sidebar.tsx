"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox,
  BookOpen,
  FileText,
  BookMarked,
  Layers,
  Brain,
  BarChart3,
  NotebookPen,
  Network,
  LayoutDashboard,
  Settings,
  Paintbrush,
  Headphones,
  Search,
  Timer,
  LineChart,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  match?: "exact" | "prefix";
};

const groups: { title: string; items: NavItem[] }[] = [
  {
    title: "Captura",
    items: [
      { href: "/inbox", label: "Inbox", icon: Inbox },
      { href: "/fontes", label: "Fontes", icon: BookOpen },
      { href: "/notas", label: "Notas", icon: FileText },
      { href: "/leitor", label: "Leitor", icon: BookMarked },
    ],
  },
  {
    title: "Memória",
    items: [
      { href: "/revisao", label: "Revisão", icon: Brain, match: "exact" },
      {
        href: "/revisao/dashboard",
        label: "Stats FSRS",
        icon: LineChart,
        match: "exact",
      },
      { href: "/playlist", label: "Playlist", icon: Headphones },
    ],
  },
  {
    title: "Métodos",
    items: [
      { href: "/metodos", label: "Biblioteca", icon: Layers },
      { href: "/stacks", label: "Stacks", icon: LayoutDashboard },
      { href: "/sessoes", label: "Sessões", icon: Timer },
    ],
  },
  {
    title: "Insights",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
      { href: "/grafo", label: "Grafo", icon: Network },
      { href: "/canvas", label: "Canvas", icon: Paintbrush },
      { href: "/query", label: "Query", icon: Search },
      { href: "/diario", label: "Diário", icon: NotebookPen },
    ],
  },
  {
    title: "Sistema",
    items: [{ href: "/config", label: "Config", icon: Settings }],
  },
];

function isActive(pathname: string, item: NavItem) {
  if (item.match === "exact") return pathname === item.href;
  return pathname === item.href || pathname.startsWith(item.href + "/");
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-slate-200/80 bg-slate-50/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950">
      <div className="flex h-14 items-center gap-2.5 border-b border-slate-200/80 px-4 dark:border-slate-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm dark:bg-slate-100">
          🧠
        </div>
        <div>
          <p className="text-sm font-bold leading-none tracking-tight">Polimata</p>
          <p className="mt-0.5 text-[10px] text-slate-500">Não um método. Uma orquestra.</p>
        </div>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {g.title}
            </p>
            <div className="space-y-0.5">
              {g.items.map((item) => {
                const active = isActive(pathname, item);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors",
                      active
                        ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                        : "text-slate-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-800/80"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-80" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200/80 p-3 dark:border-slate-800">
        <p className="text-[10px] leading-relaxed text-slate-400">
          local-first · SQLite · FSRS
          <br />
          <kbd className="rounded border border-slate-200 px-1 dark:border-slate-700">⌘K</kbd> busca
          {" · "}
          <kbd className="rounded border border-slate-200 px-1 dark:border-slate-700">⌘P</kbd> comandos
        </p>
      </div>
    </aside>
  );
}
