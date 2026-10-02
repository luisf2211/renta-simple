import type { NextRequest } from "next/server";
import { fetchVehicle, updateVehicle } from "@/lib/supabase/service";
import { handle, fail } from "@/lib/supabase/http";
import type { Vehicle } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const v = await fetchVehicle(params.id);
  if (!v) return fail("Vehículo no encontrado", 404);
  return handle(async () => v);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = (await req.json()) as Partial<Vehicle>;
  return handle(() => updateVehicle(params.id, body));
}
