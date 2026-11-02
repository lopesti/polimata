import { PageHeader } from "@/components/ui/page-header";
import { SimpleCanvas } from "@/components/canvas/simple-canvas";

export default function CanvasPage() {
  return (
    <div className="p-8">
      <PageHeader
        eyebrow="Síntese visual"
        title="Canvas"
        description="Quadro livre estilo Heptabase (MVP local). Cards arrastáveis salvos no navegador."
      />
      <SimpleCanvas />
    </div>
  );
}
