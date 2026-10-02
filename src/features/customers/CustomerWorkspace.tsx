"use client";

import {
  Box,
  Flex,
  Text,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  SimpleGrid,
  Image,
} from "@chakra-ui/react";
import { Pencil, FilePlus } from "lucide-react";
import type { Customer } from "@/types";
import { useDemoStore } from "@/store/demo-store";
import { Section, FieldRow } from "@/components/ui/Section";
import { ContractStatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatDateShort, formatCurrency } from "@/lib/formatting/format";

export function CustomerWorkspace({
  customer,
  onEdit,
  onNewContract,
  onOpenContract,
}: {
  customer: Customer;
  onEdit: () => void;
  onNewContract: () => void;
  onOpenContract: (contractId: string) => void;
}) {
  const { contracts, getVehicle, tenant } = useDemoStore();
  const customerContracts = contracts.filter((c) => c.customerId === customer.id);

  return (
    <Flex direction="column" h="100%" minH={0}>
      <Box px="20px" py="14px" borderBottom="1px solid" borderColor="canvas.border">
        <Flex justify="space-between" align="flex-start" gap="12px" wrap="wrap">
          <Box>
            <Text fontSize="20px" fontWeight="800" lineHeight="1.1">
              {customer.fullName}
            </Text>
            <Text fontSize="13px" color="fg.muted">
              {customer.phone} · {customer.email || "sin email"}
            </Text>
          </Box>
          <Flex gap="8px">
            <Button size="sm" variant="outline" leftIcon={<Pencil size={14} />} onClick={onEdit}>
              Editar
            </Button>
            <Button
              size="sm"
              colorScheme="red"
              bg="brand.500"
              _hover={{ bg: "brand.600" }}
              leftIcon={<FilePlus size={14} />}
              onClick={onNewContract}
            >
              Nuevo contrato
            </Button>
          </Flex>
        </Flex>
      </Box>

      <Tabs variant="unstyled" display="flex" flexDirection="column" flex="1" minH={0}>
        <TabList px="20px" borderBottom="1px solid" borderColor="canvas.border" gap="2px">
          {["Información", "Documentos", "Contratos"].map((l) => (
            <Tab
              key={l}
              fontSize="13px"
              fontWeight="500"
              color="fg.muted"
              px="10px"
              py="10px"
              borderBottom="2px solid transparent"
              _selected={{ color: "fg.default", fontWeight: "600", borderColor: "brand.500" }}
            >
              {l}
            </Tab>
          ))}
        </TabList>

        <TabPanels flex="1" minH={0} overflowY="auto">
          <TabPanel p="20px">
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing="28px">
              <Section title="Información personal">
                <FieldRow label="Teléfono">{customer.phone}</FieldRow>
                <FieldRow label="Email">{customer.email || "—"}</FieldRow>
                <FieldRow label="Fecha de nacimiento">
                  {customer.dateOfBirth ? formatDate(customer.dateOfBirth) : "—"}
                </FieldRow>
                <FieldRow label="Nacionalidad">{customer.nationality || "—"}</FieldRow>
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
                {customer.notes && <FieldRow label="Notas">{customer.notes}</FieldRow>}
              </Section>
            </SimpleGrid>
          </TabPanel>

          <TabPanel p="20px">
            <Section title="Documento de identidad">
              {customer.licenseFrontImage || customer.licenseBackImage ? (
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing="12px" maxW="520px">
                  {customer.licenseFrontImage && (
                    <DocThumb label="Licencia · Frontal" src={customer.licenseFrontImage.dataUrl} />
                  )}
                  {customer.licenseBackImage && (
                    <DocThumb label="Licencia · Posterior" src={customer.licenseBackImage.dataUrl} />
                  )}
                </SimpleGrid>
              ) : (
                <Text fontSize="12px" color="fg.subtle">
                  El cliente aún no ha cargado documentos. Se recopilan en el flujo de firma.
                </Text>
              )}
            </Section>
          </TabPanel>

          <TabPanel p="20px">
            {customerContracts.length === 0 ? (
              <Text fontSize="13px" color="fg.muted">
                Sin contratos.
              </Text>
            ) : (
              <Flex direction="column" border="1px solid" borderColor="canvas.border" borderRadius="8px" overflow="hidden">
                {customerContracts.map((c) => {
                  const v = getVehicle(c.vehicleId);
                  return (
                    <Flex
                      as="button"
                      key={c.id}
                      onClick={() => onOpenContract(c.id)}
                      align="center"
                      justify="space-between"
                      px="14px"
                      py="10px"
                      borderBottom="1px solid"
                      borderColor="canvas.borderMuted"
                      _hover={{ bg: "canvas.subtle" }}
                      textAlign="left"
                      gap="10px"
                    >
                      <Box minW={0}>
                        <Flex align="center" gap="8px">
                          <Text fontSize="13px" fontWeight="700">
                            {c.contractNumber}
                          </Text>
                          <ContractStatusBadge status={c.status} />
                        </Flex>
                        <Text fontSize="12px" color="fg.muted" noOfLines={1}>
                          {v ? `${v.brand} ${v.model} ${v.year}` : "—"} ·{" "}
                          {formatDateShort(c.pickupAt)} → {formatDateShort(c.returnAt)}
                        </Text>
                      </Box>
                      <Text fontSize="13px" fontWeight="600" flexShrink={0}>
                        {formatCurrency(c.total, tenant.currency)}
                      </Text>
                    </Flex>
                  );
                })}
              </Flex>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
}

function DocThumb({ label, src }: { label: string; src: string }) {
  return (
    <Box>
      <Text fontSize="11px" color="fg.muted" mb="4px">
        {label}
      </Text>
      <Image src={src} alt={label} borderRadius="6px" border="1px solid" borderColor="canvas.border" w="100%" />
    </Box>
  );
}
