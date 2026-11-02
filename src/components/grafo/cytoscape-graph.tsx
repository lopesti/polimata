"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Node = { id: string; label: string; tipo: string; href: string };
type Edge = { from: string; to: string; label: string };

const colors: Record<string, string> = {
  fonte: "#3b82f6",
  nota: "#10b981",
  metodo: "#8b5cf6",
  stack: "#f59e0b",
  pergunta: "#ef4444",
};

export function CytoscapeGraph({
  nodes,
  edges,
}: {
  nodes: Node[];
  edges: Edge[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    let cy: any;
    let cancelled = false;

    async function mount() {
      if (!ref.current) return;
      try {
        const cytoscape = (await import("cytoscape")).default;
        if (cancelled) return;
        cy = cytoscape({
          container: ref.current,
          elements: [
            ...nodes.map((n) => ({
              data: { id: n.id, label: n.label, tipo: n.tipo, href: n.href },
            })),
            ...edges
              .filter((e) => nodes.some((n) => n.id === e.from) && nodes.some((n) => n.id === e.to))
              .map((e, i) => ({
                data: {
                  id: `e${i}`,
                  source: e.from,
                  target: e.to,
                  label: e.label,
                },
              })),
          ],
          style: [
            {
              selector: "node",
              style: {
                label: "data(label)",
                "font-size": 9,
                color: "#334155",
                "text-valign": "bottom",
                "text-margin-y": 6,
                width: 14,
                height: 14,
                "background-color": "#64748b",
              },
            },
            ...Object.entries(colors).map(([tipo, color]) => ({
              selector: `node[tipo = "${tipo}"]`,
              style: { "background-color": color },
            })),
            {
              selector: "edge",
              style: {
                width: 1,
                "line-color": "#cbd5e1",
                "target-arrow-color": "#cbd5e1",
                "target-arrow-shape": "triangle",
                "curve-style": "bezier",
              },
            },
          ],
          layout: { name: "cose", animate: false, padding: 30 },
        });
        cy.on("tap", "node", (evt: any) => {
          const href = evt.target.data("href");
          if (href) router.push(href);
        });
      } catch (e) {
        console.warn("Cytoscape indisponível, use o grafo SVG fallback", e);
      }
    }
    mount();
    return () => {
      cancelled = true;
      cy?.destroy();
    };
  }, [nodes, edges, router]);

  return (
    <div
      ref={ref}
      className="h-[520px] w-full rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950"
    />
  );
}
