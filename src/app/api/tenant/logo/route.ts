import type { NextRequest } from "next/server";
import { uploadTenantLogo } from "@/lib/supabase/service";
import { handle } from "@/lib/supabase/http";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { dataUrl: string; fileName?: string };
  return handle(() => uploadTenantLogo(body));
}
