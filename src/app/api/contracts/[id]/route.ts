import type { NextRequest } from "next/server";
import { fetchContract } from "@/lib/supabase/service";
import { updateContract, deleteContract } from "@/lib/supabase/contract-mutations";
import { handle, fail } from "@/lib/supabase/http";
import type { Contract } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const c = await fetchContract(params.id);
  if (!c) return fail("Contrato no encontrado", 404);
  return handle(async () => c);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = (await req.json()) as Partial<Contract>;
  return handle(() => updateContract(params.id, body));
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  return handle(async () => {
    await deleteContract(params.id);
    return { ok: true };
  });
}
