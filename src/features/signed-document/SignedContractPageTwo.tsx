"use client";

import { Box, Flex, Text, SimpleGrid, Image } from "@chakra-ui/react";
import type { SignedSnapshot } from "@/types";
import { DOC, A4 } from "./docStyles";
import { DocSectionTitle, DocPageHeader, DocFooter } from "./DocComponents";
import { SignatureVerification } from "./SignatureVerification";
import { formatDateTimeNumeric } from "@/lib/formatting/format";

export function SignedContractPageTwo({
  snapshot,
  contractNumber,
  verifyUrl,
}: {
  snapshot: SignedSnapshot;
  contractNumber: string;
  verifyUrl: string;
}) {
  const { business, terms, signature } = snapshot;

  return (
    <Box
      className="print-page"
      bg={DOC.pageBg}
      color={DOC.ink}
      w={{ base: "100%", md: A4.width }}
      minH={{ md: A4.minHeight }}
      mx="auto"
      p={{ base: "20px", md: "16mm" }}
      boxShadow={{ base: "none", md: "0 1px 4px rgba(0,0,0,0.12)" }}
      fontSize="11px"
    >
      <DocPageHeader
        business={business}
        compact
        contractNumber={contractNumber}
        pageLabel="Página 2 de 2"
      />

      <Box mb="16px">
        <DocSectionTitle>Términos y condiciones</DocSectionTitle>
        <Flex direction="column" gap="7px">
          {terms.map((t, i) => (
            <Box key={i}>
              <Text fontSize="10px" fontWeight="700">
                {i + 1}. {t.title}
              </Text>
              <Text fontSize="9.5px" color={DOC.muted} lineHeight="1.4">
                {t.body}
              </Text>
            </Box>
          ))}
        </Flex>
      </Box>

      {/* Firmas */}
      <Box mb="16px">
        <DocSectionTitle>Firmas</DocSectionTitle>
        <SimpleGrid columns={2} spacing="24px">
          <SignatureBlock
            title="Firma del arrendatario"
            signature={snapshot.customerSignature}
            name={snapshot.customer.fullName}
            role="Arrendatario"
            timestamp={formatDateTimeNumeric(signature.signedAt)}
          />
          <SignatureBlock
            title="Firma del representante"
            signature={snapshot.representativeSignature}
            name={snapshot.representativeName}
            role={business.businessName}
            timestamp={formatDateTimeNumeric(signature.signedAt)}
          />
        </SimpleGrid>
      </Box>

      <SignatureVerification
        contractNumber={contractNumber}
        metadata={signature}
        verifyUrl={verifyUrl}
      />

      <DocFooter contractNumber={contractNumber} pageLabel="Página 2 de 2" />
    </Box>
  );
}

function SignatureBlock({
  title,
  signature,
  name,
  role,
  timestamp,
}: {
  title: string;
  signature?: string;
  name: string;
  role: string;
  timestamp: string;
}) {
  return (
    <Box>
      <Text fontSize="9px" color={DOC.muted} mb="4px">
        {title}
      </Text>
      <Flex
        align="flex-end"
        justify="center"
        h="60px"
        borderBottom={`1px solid ${DOC.ink}`}
        mb="4px"
      >
        {signature ? (
          <Image src={signature} alt={`Firma de ${name}`} maxH="56px" />
        ) : (
          <Box h="56px" />
        )}
      </Flex>
      <Text fontSize="11px" fontWeight="700">
        {name}
      </Text>
      <Text fontSize="9px" color={DOC.muted}>
        {role}
      </Text>
      <Text fontSize="9px" color={DOC.subtle}>
        {timestamp}
      </Text>
    </Box>
  );
}
