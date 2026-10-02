import type { NextRequest } from "next/server";
import { fetchCustomer, updateCustomer } from "@/lib/supabase/service";
import { handle, fail } from "@/lib/supabase/http";
import type { Customer } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const c = await fetchCustomer(params.id);
  if (!c) return fail("Cliente no encontrado", 404);
  return handle(async () => c);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = (await req.json()) as Partial<Customer>;
  return handle(() => updateCustomer(params.id, body));
}
