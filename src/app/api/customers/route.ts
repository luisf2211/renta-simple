import type { NextRequest } from "next/server";
import { fetchCustomers, createCustomer } from "@/lib/supabase/service";
import { handle } from "@/lib/supabase/http";
import type { Customer } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(() => fetchCustomers());
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<Customer>;
  return handle(() => createCustomer(body));
}
