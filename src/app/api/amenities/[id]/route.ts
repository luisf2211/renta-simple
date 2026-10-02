import type { NextRequest } from "next/server";
import { updateAmenity, deleteAmenity } from "@/lib/supabase/service";
import { handle } from "@/lib/supabase/http";
import type { Amenity } from "@/types";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = (await req.json()) as Partial<Amenity>;
  return handle(() => updateAmenity(params.id, body));
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  return handle(async () => {
    await deleteAmenity(params.id);
    return { ok: true };
  });
}
