"use client";

import { Box, Flex, Text, Center, Spinner, Badge } from "@chakra-ui/react";
import NextLink from "next/link";
import { ShieldCheck, ShieldX } from "lucide-react";
import { useDemoStore } from "@/store/demo-store";
import { LogoMark } from "@/components/ui/LogoMark";
import { Section, FieldRow } from "@/components/ui/Section";
import { formatDateTime } from "@/lib/formatting/format";

export function VerificationView({ id }: { id: string }) {
  const { ready, contracts, tenant } = useDemoStore();

  if (!ready) {
    return (
      <Center minH="100dvh">
        <Spinner color="brand.500" thickness="2px" />
      </Center>
    );
  }

  const contract = contracts.find(
    (c) => c.signatureMetadata?.verificationId === id || c.signedSnapshot?.signature.verificationId === id,
  );
  const snapshot = contract?.signedSnapshot;

  return (
    <Box minH="100dvh" bg="canvas.subtle">
      <Box maxW="440px" mx="auto" bg="white" minH="100dvh" boxShadow={{ md: "0 0 0 1px #e4e8ec" }}>
        <Flex px="16px" py="12px" borderBottom="1px solid" borderColor="canvas.border">
          <LogoMark label={tenant.logo} variant="dark" size="sm" />
        </Flex>

        {contract && snapshot ? (
          <Box px="20px" py="28px">
            <Flex direction="column" align="center" gap="10px" mb="24px" textAlign="center">
              <Flex
                align="center"
                justify="center"
                w="56px"
                h="56px"
                borderRadius="999px"
                bg="rgba(26,127,55,0.1)"
                color="#1a7f37"
              >
                <ShieldCheck size={28} />
              </Flex>
              <Text fontSize="18px" fontWeight="800">
                Documento válido
              </Text>
              <Badge colorScheme="green" fontSize="10px">
                Firma verificada
              </Badge>
            </Flex>

            <Section title="Detalles del contrato">
              <FieldRow label="Contrato">{contract.contractNumber}</FieldRow>
              <FieldRow label="Empresa">{snapshot.business.businessName}</FieldRow>
              <FieldRow label="Arrendatario">{snapshot.customer.fullName}</FieldRow>
              <FieldRow label="Vehículo">
                {snapshot.vehicle.brand} {snapshot.vehicle.model} {snapshot.vehicle.year}
              </FieldRow>
              <FieldRow label="Firmado">{formatDateTime(snapshot.signature.signedAt)}</FieldRow>
              <FieldRow label="Versión">{snapshot.signature.documentVersion}</FieldRow>
              <FieldRow label="Verification ID" mono>
                {snapshot.signature.verificationId}
              </FieldRow>
            </Section>

            <Box mt="20px" bg="canvas.subtle" borderRadius="8px" p="12px">
              <Text fontSize="11px" color="fg.muted">
                Verificación de demostración. En producción esta página confirmará la
                autenticidad contra el registro firmado almacenado de forma segura.
              </Text>
            </Box>
          </Box>
        ) : (
          <Flex direction="column" align="center" gap="12px" py="60px" px="20px" textAlign="center">
            <Flex
              align="center"
              justify="center"
              w="56px"
              h="56px"
              borderRadius="999px"
              bg="rgba(207,34,46,0.1)"
              color="#cf222e"
            >
              <ShieldX size={28} />
            </Flex>
            <Text fontSize="16px" fontWeight="700">
              No se pudo verificar
            </Text>
            <Text fontSize="13px" color="fg.muted">
              No encontramos un documento firmado con este identificador en este navegador.
            </Text>
            <Text
              as={NextLink}
              href="/"
              fontSize="12px"
              color="brand.600"
              textDecoration="underline"
            >
              Ir al inicio
            </Text>
          </Flex>
        )}
      </Box>
    </Box>
  );
}
