import { notFound } from "next/navigation";
import { db } from "@/lib/db/client";
import { notas, blocos } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { NotaEditorClient } from "@/components/notas/nota-editor-client";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

export default function NotaDetalhePage({ params }: Props) {
  const [nota] = db.select().from(notas).where(eq(notas.id, params.id)).all();
  if (!nota) notFound();

  const blocosNota = db
    .select()
    .from(blocos)
    .where(eq(blocos.notaId, params.id))
    .orderBy(asc(blocos.ordem))
    .all();

  return (
    <NotaEditorClient
      nota={{
        id: nota.id,
        titulo: nota.titulo,
        tipo: nota.tipo,
        status: nota.status,
        tags: (nota.tags as string[] | null) ?? [],
        blocos: blocosNota.map((b) => ({
          id: b.id,
          tipo: b.tipo,
          conteudo: b.conteudo,
          ordem: b.ordem,
        })),
      }}
    />
  );
}
