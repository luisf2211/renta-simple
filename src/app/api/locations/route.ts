import type { NextRequest } from "next/server";
import { fetchLocations, createLocation } from "@/lib/supabase/service";
import { handle } from "@/lib/supabase/http";
import type { Location } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(() => fetchLocations());
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<Location>;
  return handle(() => createLocation(body));
}
