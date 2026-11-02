import { db } from "@/lib/db/client";
import { fontes, notas, metodos, stacks, perguntas, links } from "@/lib/db/schema";
import { PageHeader } from "@/components/ui/page-header";
import { CytoscapeGraph } from "@/components/grafo/cytoscape-graph";

export const dynamic = "force-dynamic";

export default function GrafoPage() {
  const f = db.select().from(fontes).all();
  const n = db.select().from(notas).all();
  const m = db.select().from(metodos).limit(12).all();
  const s = db.select().from(stacks).all();
  const p = db.select().from(perguntas).limit(20).all();
  const l = db.select().from(links).all();

  const nodes = [
    ...f.map((x) => ({
      id: x.id,
      label: x.titulo.slice(0, 28),
      tipo: "fonte",
      href: `/fontes/${x.id}`,
    })),
    ...n.map((x) => ({
      id: x.id,
      label: (x.titulo ?? "nota").slice(0, 28),
      tipo: "nota",
      href: `/notas/${x.id}`,
    })),
    ...s.map((x) => ({
      id: x.id,
      label: x.nome.slice(0, 28),
      tipo: "stack",
      href: `/stacks`,
    })),
    ...p.map((x) => ({
      id: x.id,
      label: x.frente.slice(0, 24),
      tipo: "pergunta",
      href: `/revisao`,
    })),
    ...m.map((x) => ({
      id: x.id,
      label: x.nome.slice(0, 28),
      tipo: "metodo",
      href: `/metodos`,
    })),
  ];

  const edges: { from: string; to: string; label: string }[] = [];
  for (const nota of n) {
    if (nota.fonteId) edges.push({ from: nota.id, to: nota.fonteId, label: "deriva" });
  }
  for (const link of l) {
    edges.push({
      from: link.origemId,
      to: link.destinoId,
      label: link.tipoLink ?? "relacionado",
    });
  }

  return (
    <div className="p-8">
      <PageHeader
        eyebrow="Conhecimento"
        title="Grafo interativo"
        description={`${nodes.length} nós · ${edges.length} arestas · layout cose (Cytoscape). Clique no nó para abrir.`}
      />
      <CytoscapeGraph nodes={nodes} edges={edges} />
      <p className="mt-2 text-xs text-slate-400">
        Requer dependência cytoscape instalada. Se o canvas ficar vazio, rode npm install.
      </p>
    </div>
  );
}
