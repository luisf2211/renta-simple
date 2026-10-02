import type { NextRequest } from "next/server";
import { updateLocation, deleteLocation } from "@/lib/supabase/service";
import { handle } from "@/lib/supabase/http";
import type { Location } from "@/types";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = (await req.json()) as Partial<Location>;
  return handle(() => updateLocation(params.id, body));
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  return handle(async () => {
    await deleteLocation(params.id);
    return { ok: true };
  });
}
