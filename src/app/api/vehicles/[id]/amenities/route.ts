import type { NextRequest } from "next/server";
import { setVehicleAmenities, fetchVehicle } from "@/lib/supabase/service";
import { handle } from "@/lib/supabase/http";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = (await req.json()) as { amenityIds: string[] };
  return handle(async () => {
    await setVehicleAmenities(params.id, body.amenityIds ?? []);
    return fetchVehicle(params.id);
  });
}
