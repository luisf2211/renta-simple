import { VerificationView } from "@/features/signed-document/VerificationView";

export default function VerifyPage({ params }: { params: { id: string } }) {
  return <VerificationView id={params.id} />;
}
