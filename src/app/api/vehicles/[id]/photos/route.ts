import type { NextRequest } from "next/server";
import { uploadVehiclePhoto } from "@/lib/supabase/service";
import { handle } from "@/lib/supabase/http";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = (await req.json()) as {
    dataUrl: string;
    fileName?: string;
    isPrimary?: boolean;
  };
  return handle(() =>
    uploadVehiclePhoto({
      vehicleId: params.id,
      dataUrl: body.dataUrl,
      fileName: body.fileName,
      isPrimary: body.isPrimary,
    }),
  );
}
