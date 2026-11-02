import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db/client";
import { fontes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { LeitorClient } from "@/components/leitor/leitor-client";

export const dynamic = "force-dynamic";

type Props = { params: { fonteId: string } };

export default function LeitorFontePage({ params }: Props) {
  const [fonte] = db
    .select()
    .from(fontes)
    .where(eq(fontes.id, params.fonteId))
    .all();

  if (!fonte) notFound();
  const text = fonte.conteudoBruto?.trim() || "";
  if (!text) {
    return (
      <div className="p-8">
        <Link href="/leitor" className="text-sm text-slate-500 hover:underline">
          ← Leitor
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{fonte.titulo}</h1>
        <p className="mt-4 text-slate-500">
          Esta fonte não tem conteúdo bruto.{" "}
          <Link href={`/fontes/${fonte.id}`} className="text-blue-600 hover:underline">
            Editar fonte
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/leitor" className="text-sm text-slate-500 hover:underline">
          ← Leitor
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{fonte.titulo}</h1>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge>{fonte.tipo}</Badge>
          {fonte.autor && <Badge variant="outline">{fonte.autor}</Badge>}
          {fonte.tema && <Badge variant="secondary">{fonte.tema}</Badge>}
        </div>
      </div>

      <LeitorClient
        fonteId={fonte.id}
        titulo={fonte.titulo}
        text={text}
      />
    </div>
  );
}
