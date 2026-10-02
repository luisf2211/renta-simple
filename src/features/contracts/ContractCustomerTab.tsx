"use client";

import { Box, Flex, Text, SimpleGrid, Image } from "@chakra-ui/react";
import type { Customer } from "@/types";
import { Section, FieldRow } from "@/components/ui/Section";
import { formatDate } from "@/lib/formatting/format";

export function ContractCustomerTab({ customer }: { customer?: Customer }) {
  if (!customer) {
    return (
      <Box p="20px">
        <Text fontSize="13px" color="fg.muted">
          Sin cliente asociado.
        </Text>
      </Box>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, xl: 2 }} spacing="28px" p="20px">
      <Flex direction="column" gap="22px">
        <Section title="Información personal">
          <Text fontWeight="600" fontSize="13px" mb="4px">
            {customer.fullName}
          </Text>
          <FieldRow label="Teléfono">{customer.phone}</FieldRow>
          <FieldRow label="Email">{customer.email}</FieldRow>
          <FieldRow label="Fecha de nacimiento">{formatDate(customer.dateOfBirth)}</FieldRow>
          <FieldRow label="Nacionalidad">{customer.nationality}</FieldRow>
          <FieldRow label="Dirección">{customer.address || "—"}</FieldRow>
          <FieldRow label="Ciudad">{customer.city || "—"}</FieldRow>
          <FieldRow label="País">{customer.country || "—"}</FieldRow>
        </Section>

        <Section title="Licencia de conducir">
          <FieldRow label="Número">{customer.licenseNumber || "—"}</FieldRow>
          <FieldRow label="País emisor">{customer.licenseCountry || "—"}</FieldRow>
          <FieldRow label="Vencimiento">
            {customer.licenseExpiration ? formatDate(customer.licenseExpiration) : "—"}
          </FieldRow>
        </Section>
      </Flex>

      <Flex direction="column" gap="22px">
        <Section title="Documento de identidad">
          {customer.licenseFrontImage || customer.licenseBackImage ? (
            <SimpleGrid columns={2} spacing="10px">
              {customer.licenseFrontImage && (
                <DocThumb label="Frontal" src={customer.licenseFrontImage.dataUrl} />
              )}
              {customer.licenseBackImage && (
                <DocThumb label="Posterior" src={customer.licenseBackImage.dataUrl} />
              )}
            </SimpleGrid>
          ) : (
            <Text fontSize="12px" color="fg.subtle">
              El cliente aún no ha cargado su documento.
            </Text>
          )}
        </Section>
      </Flex>
    </SimpleGrid>
  );
}

function DocThumb({ label, src }: { label: string; src: string }) {
  return (
    <Box>
      <Text fontSize="11px" color="fg.muted" mb="4px">
        {label}
      </Text>
      <Image
        src={src}
        alt={`Documento ${label}`}
        borderRadius="6px"
        border="1px solid"
        borderColor="canvas.border"
        w="100%"
      />
    </Box>
  );
}
