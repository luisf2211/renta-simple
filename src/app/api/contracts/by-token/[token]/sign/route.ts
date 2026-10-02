import type { NextRequest } from "next/server";
import { signContractByToken } from "@/lib/supabase/contract-mutations";
import { handle } from "@/lib/supabase/http";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const body = (await req.json()) as {
    signatureDataUrl: string;
    documentHash?: string;
    userAgent?: string;
  };
  return handle(() =>
    signContractByToken({
      token: params.token,
      signatureDataUrl: body.signatureDataUrl,
      documentHash: body.documentHash,
      userAgent: body.userAgent,
    }),
  );
}
