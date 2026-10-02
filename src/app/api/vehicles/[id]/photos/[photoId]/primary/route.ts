import type { NextRequest } from "next/server";
import { setPrimaryVehiclePhoto, fetchVehicle } from "@/lib/supabase/service";
import { handle } from "@/lib/supabase/http";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string; photoId: string } },
) {
  return handle(async () => {
    await setPrimaryVehiclePhoto(params.photoId);
    return fetchVehicle(params.id);
  });
}
