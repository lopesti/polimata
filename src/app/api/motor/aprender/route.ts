import { ok, fail } from "@/lib/api/http";
import { aprenderComDiario } from "@/lib/motor/aprender";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = aprenderComDiario();
    return ok(result);
  } catch (error) {
    console.error(error);
    return fail("Falha ao aprender com diário/sessões", 500);
  }
}
