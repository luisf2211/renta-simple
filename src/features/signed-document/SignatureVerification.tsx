"use client";

import { Box, Flex, Text, SimpleGrid } from "@chakra-ui/react";
import { DOC } from "./docStyles";
import { QrCode } from "@/components/ui/QrCode";
import type { SignatureMetadata } from "@/types";
import { formatDateTimeNumeric } from "@/lib/formatting/format";

export function SignatureVerification({
  contractNumber,
  metadata,
  verifyUrl,
}: {
  contractNumber: string;
  metadata: SignatureMetadata;
  verifyUrl: string;
}) {
  return (
    <Box bg={DOC.subtleBg} border={`1px solid ${DOC.ruleMuted}`} borderRadius="6px" p="12px">
      <Text fontSize="9px" fontWeight="800" color={DOC.ink} textTransform="uppercase" letterSpacing="0.06em" mb="8px">
        Información de firma electrónica
      </Text>
      <Flex gap="14px" align="center">
        <Box flexShrink={0} border={`1px solid ${DOC.rule}`} borderRadius="4px" p="4px" bg="#fff">
          <QrCode value={verifyUrl} size={84} />
        </Box>
        <SimpleGrid columns={2} spacing="2px 16px" flex="1">
          <Field label="Contrato" value={contractNumber} />
          <Field label="Firmado" value={formatDateTimeNumeric(metadata.signedAt)} />
          <Field label="Versión" value={String(metadata.documentVersion)} />
          <Field label="Verification ID" value={metadata.verificationId} mono />
          <Box gridColumn="1 / -1">
            <Field label="Document hash" value={metadata.documentHash} mono wrap />
          </Box>
        </SimpleGrid>
      </Flex>
      <Text fontSize="8px" color={DOC.subtle} mt="8px">
        Documento electrónico generado por la plataforma. Este documento tiene la misma validez
        legal que una firma manuscrita. Para verificar la autenticidad escanea el código QR o
        visita: {verifyUrl}
      </Text>
    </Box>
  );
}

function Field({
  label,
  value,
  mono,
  wrap,
}: {
  label: string;
  value: string;
  mono?: boolean;
  wrap?: boolean;
}) {
  return (
    <Box>
      <Text fontSize="8px" color={DOC.muted} textTransform="uppercase">
        {label}
      </Text>
      <Text
        fontSize={mono ? "8px" : "10px"}
        fontFamily={mono ? "mono" : undefined}
        color={DOC.ink}
        wordBreak={wrap ? "break-all" : "normal"}
      >
        {value}
      </Text>
    </Box>
  );
}
