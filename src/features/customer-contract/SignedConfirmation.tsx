"use client";

import { Box, Flex, Text, Button } from "@chakra-ui/react";
import NextLink from "next/link";
import { CheckCircle2, FileText, Printer } from "lucide-react";
import type { Contract } from "@/types";
import { formatDateTime } from "@/lib/formatting/format";

/**
 * Read-only post-signature screen. Deliberately removes any Continuar /
 * Actualizar / Solicitar corrección / Firmar actions — the contract is now
 * immutable from the customer's side.
 */
export function SignedConfirmation({ contract }: { contract: Contract }) {
  const signedAt = contract.signatureMetadata?.signedAt ?? contract.signedAt ?? "";

  return (
    <Box px="16px" py="40px" textAlign="center">
      <Flex
        align="center"
        justify="center"
        w="64px"
        h="64px"
        borderRadius="999px"
        bg="rgba(26,127,55,0.1)"
        color="#1a7f37"
        mx="auto"
        mb="16px"
      >
        <CheckCircle2 size={34} />
      </Flex>
      <Text fontSize="20px" fontWeight="800">
        Contrato firmado
      </Text>
      <Text fontSize="13px" color="fg.muted" mt="4px" mb="2px">
        Gracias. Tu contrato <b>{contract.contractNumber}</b> fue firmado correctamente.
      </Text>
      <Text fontSize="12px" color="fg.subtle" mb="28px">
        Firmado el {signedAt ? formatDateTime(signedAt) : "—"}
      </Text>

      <Flex direction="column" gap="10px" maxW="320px" mx="auto">
        <Button
          as={NextLink}
          href={`/c/${contract.token}/document`}
          size="md"
          colorScheme="red"
          bg="brand.500"
          _hover={{ bg: "brand.600" }}
          leftIcon={<FileText size={16} />}
        >
          Ver contrato firmado
        </Button>
        <Button
          as={NextLink}
          href={`/c/${contract.token}/document?print=1`}
          size="md"
          variant="outline"
          leftIcon={<Printer size={16} />}
        >
          Imprimir / Guardar PDF
        </Button>
      </Flex>

      <Text fontSize="11px" color="fg.subtle" mt="24px">
        Recibirás una copia del documento firmado por correo electrónico.
      </Text>
    </Box>
  );
}
