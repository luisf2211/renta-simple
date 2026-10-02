"use client";

import { Box } from "@chakra-ui/react";
import type { SignedSnapshot } from "@/types";
import { SignedContractPageOne } from "./SignedContractPageOne";
import { SignedContractPageTwo } from "./SignedContractPageTwo";

/**
 * Reusable two-page signed contract document. Renders purely from the immutable
 * SignedSnapshot captured at signing time (never from live records), so the
 * document is stable even if master data changes later.
 */
export function SignedContractDocument({
  snapshot,
  contractNumber,
  verifyUrl,
}: {
  snapshot: SignedSnapshot;
  contractNumber: string;
  verifyUrl: string;
}) {
  return (
    <Box className="print-root">
      <SignedContractPageOne snapshot={snapshot} contractNumber={contractNumber} />
      <Box h={{ base: "16px", md: "24px" }} className="no-print" />
      <SignedContractPageTwo
        snapshot={snapshot}
        contractNumber={contractNumber}
        verifyUrl={verifyUrl}
      />
    </Box>
  );
}
