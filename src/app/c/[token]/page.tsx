import { CustomerContractFlow } from "@/features/customer-contract/CustomerContractFlow";

export default function CustomerContractPage({
  params,
}: {
  params: { token: string };
}) {
  return <CustomerContractFlow token={params.token} />;
}
