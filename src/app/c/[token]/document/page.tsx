import { Suspense } from "react";
import { SignedDocumentView } from "@/features/signed-document/SignedDocumentView";

export default function SignedDocumentPage({
  params,
}: {
  params: { token: string };
}) {
  return (
    <Suspense fallback={null}>
      <SignedDocumentView token={params.token} />
    </Suspense>
  );
}
