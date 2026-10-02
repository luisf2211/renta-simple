import type { NextRequest } from "next/server";
import { appendEvent } from "@/lib/supabase/contract-mutations";
import { handle } from "@/lib/supabase/http";
import type { ContractEventType } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = (await req.json()) as {
    type: ContractEventType;
    actor: string;
    description: string;
  };
  return handle(async () => {
    await appendEvent(params.id, body.type, body.actor, body.description);
    return { ok: true };
  });
}
