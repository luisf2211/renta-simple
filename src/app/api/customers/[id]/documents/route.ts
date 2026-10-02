import type { NextRequest } from "next/server";
import { uploadCustomerDocument, type CustomerDocType } from "@/lib/supabase/service";
import { handle } from "@/lib/supabase/http";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = (await req.json()) as {
    documentType: CustomerDocType;
    dataUrl: string;
    fileName?: string;
  };
  return handle(() =>
    uploadCustomerDocument({
      customerId: params.id,
      documentType: body.documentType,
      dataUrl: body.dataUrl,
      fileName: body.fileName,
    }),
  );
}
