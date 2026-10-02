import type { NextRequest } from "next/server";
import { fetchAmenities, createAmenity } from "@/lib/supabase/service";
import { handle } from "@/lib/supabase/http";
import type { Amenity } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(() => fetchAmenities());
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<Amenity>;
  return handle(() => createAmenity(body));
}
