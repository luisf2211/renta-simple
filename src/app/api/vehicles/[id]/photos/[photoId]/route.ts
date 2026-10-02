import type { NextRequest } from "next/server";
import { deleteVehiclePhoto } from "@/lib/supabase/service";
import { handle } from "@/lib/supabase/http";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; photoId: string } },
) {
  return handle(async () => {
    await deleteVehiclePhoto(params.photoId);
    return { ok: true };
  });
}
