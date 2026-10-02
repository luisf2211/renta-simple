import type { NextRequest } from "next/server";
import { fetchTenant, updateTenant } from "@/lib/supabase/service";
import { handle } from "@/lib/supabase/http";
import type { Tenant } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(() => fetchTenant());
}

export async function PATCH(req: NextRequest) {
  const body = (await req.json()) as Partial<Tenant>;
  return handle(() => updateTenant(body));
}
