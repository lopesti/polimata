import Link from "next/link";
import { StatsDashboard } from "@/components/revisao/stats-dashboard";

export const dynamic = "force-dynamic";

export default function RevisaoDashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Módulo 10
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            Dashboard de revisão
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            FSRS · retenção · carga futura · histórico
          </p>
        </div>
        <Link
          href="/revisao"
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Voltar à fila
        </Link>
      </div>
      <StatsDashboard />
    </div>
  );
}
