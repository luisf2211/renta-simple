import type { NextRequest } from "next/server";
import { fetchContractByToken } from "@/lib/supabase/service";
import { handle, fail } from "@/lib/supabase/http";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const c = await fetchContractByToken(params.token);
  if (!c) return fail("Contrato no encontrado", 404);
  return handle(async () => c);
}
