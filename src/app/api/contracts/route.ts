import type { NextRequest } from "next/server";
import { fetchContracts } from "@/lib/supabase/service";
import { createContract } from "@/lib/supabase/contract-mutations";
import { handle } from "@/lib/supabase/http";
import type { Contract } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(() => fetchContracts());
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Contract;
  return handle(() => createContract(body));
}
