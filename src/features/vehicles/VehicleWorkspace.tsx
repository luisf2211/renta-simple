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
  Image,
} from "@chakra-ui/react";
import { Pencil, FilePlus } from "lucide-react";
import type { Vehicle } from "@/types";
import { useDemoStore } from "@/store/demo-store";
import { Section, FieldRow } from "@/components/ui/Section";
import { VehicleStatusBadge, ContractStatusBadge } from "@/components/ui/StatusBadge";
import { AmenityIcon } from "@/components/ui/AmenityIcon";
import { TRANSMISSION_LABELS } from "@/types";
import { formatCurrency, formatDateShort } from "@/lib/formatting/format";

export function VehicleWorkspace({
  vehicle,
  onEdit,
  onNewContract,
}: {
  vehicle: Vehicle;
  onEdit: () => void;
  onNewContract: () => void;
}) {
  const { contracts, getCustomer, tenant } = useDemoStore();

  const vehicleContracts = contracts.filter((c) => c.vehicleId === vehicle.id);
  const current = vehicleContracts.find((c) =>
    ["SIGNED", "DELIVERED"].includes(c.status),
  );

  return (
    <Flex direction="column" h="100%" minH={0}>
      <Box px="20px" py="14px" borderBottom="1px solid" borderColor="canvas.border">
        <Flex justify="space-between" align="flex-start" gap="12px" wrap="wrap">
          <Flex gap="14px" align="center">
            {vehicle.image && (
              <Image
                src={vehicle.image}
                alt=""
                w="110px"
                borderRadius="6px"
                border="1px solid"
                borderColor="canvas.border"
              />
            )}
            <Box>
              <Text fontSize="20px" fontWeight="800" lineHeight="1.1">
                {vehicle.brand} {vehicle.model} {vehicle.year}
              </Text>
              <Text fontSize="13px" color="fg.muted" mb="6px">
                {vehicle.plate} · {formatCurrency(vehicle.dailyRate, tenant.currency)}/día
              </Text>
              <VehicleStatusBadge status={vehicle.status} />
            </Box>
          </Flex>
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
              isDisabled={vehicle.status === "MAINTENANCE"}
            >
              Nuevo contrato
            </Button>
          </Flex>
        </Flex>
      </Box>

      <Tabs variant="unstyled" display="flex" flexDirection="column" flex="1" minH={0}>
        <TabList px="20px" borderBottom="1px solid" borderColor="canvas.border" gap="2px">
          {["Información", "Contrato actual", "Historial"].map((l) => (
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
            <Box maxW="560px">
              {vehicle.photos.length > 0 && (
                <Box mb="22px">
                  <Flex gap="8px" wrap="wrap">
                    {vehicle.photos.map((p) => (
                      <Image
                        key={p.id}
                        src={p.url}
                        alt=""
                        w="140px"
                        h="92px"
                        objectFit="cover"
                        borderRadius="6px"
                        border="1px solid"
                        borderColor={p.isPrimary ? "brand.500" : "canvas.border"}
                      />
                    ))}
                  </Flex>
                </Box>
              )}

              <Box mb="22px">
                <Section title="Especificaciones">
                  <FieldRow label="Placa">{vehicle.plate}</FieldRow>
                  <FieldRow label="VIN" mono>{vehicle.vin}</FieldRow>
                  <FieldRow label="Color">{vehicle.color}</FieldRow>
                  <FieldRow label="Transmisión">{TRANSMISSION_LABELS[vehicle.transmission]}</FieldRow>
                  <FieldRow label="Pasajeros">{vehicle.passengers}</FieldRow>
                  <FieldRow label="Flota">{vehicle.fleetNumber}</FieldRow>
                  <FieldRow label="Tarifa diaria">{formatCurrency(vehicle.dailyRate, tenant.currency)}</FieldRow>
                </Section>
              </Box>

              <Section title="Amenidades">
                {vehicle.amenities.length === 0 ? (
                  <Text fontSize="12px" color="fg.subtle">
                    Sin amenidades asignadas. Edita el vehículo para agregarlas.
                  </Text>
                ) : (
                  <Flex gap="6px" wrap="wrap">
                    {vehicle.amenities.map((a) => (
                      <Flex
                        key={a.id}
                        align="center"
                        gap="5px"
                        px="8px"
                        py="3px"
                        bg="canvas.subtle"
                        border="1px solid"
                        borderColor="canvas.border"
                        borderRadius="999px"
                        fontSize="12px"
                      >
                        <Box color="fg.muted">
                          <AmenityIcon name={a.icon} size={13} />
                        </Box>
                        {a.name}
                      </Flex>
                    ))}
                  </Flex>
                )}
              </Section>
            </Box>
          </TabPanel>

          <TabPanel p="20px">
            {current ? (
              <Box maxW="520px">
                <Section title={`Contrato ${current.contractNumber}`}>
                  <FieldRow label="Cliente">{getCustomer(current.customerId)?.fullName ?? "—"}</FieldRow>
                  <FieldRow label="Estado">
                    <ContractStatusBadge status={current.status} />
                  </FieldRow>
                  <FieldRow label="Período">
                    {formatDateShort(current.pickupAt)} → {formatDateShort(current.returnAt)}
                  </FieldRow>
                  <FieldRow label="Total">{formatCurrency(current.total, tenant.currency)}</FieldRow>
                </Section>
              </Box>
            ) : (
              <Text fontSize="13px" color="fg.muted">
                Este vehículo no tiene un contrato activo.
              </Text>
            )}
          </TabPanel>

          <TabPanel p="20px">
            {vehicleContracts.length === 0 ? (
              <Text fontSize="13px" color="fg.muted">
                Sin historial de contratos.
              </Text>
            ) : (
              <Flex direction="column" border="1px solid" borderColor="canvas.border" borderRadius="8px" overflow="hidden">
                {vehicleContracts.map((c) => (
                  <Flex
                    key={c.id}
                    align="center"
                    justify="space-between"
                    px="14px"
                    py="10px"
                    borderBottom="1px solid"
                    borderColor="canvas.borderMuted"
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
                        {getCustomer(c.customerId)?.fullName ?? "—"} ·{" "}
                        {formatDateShort(c.pickupAt)} → {formatDateShort(c.returnAt)}
                      </Text>
                    </Box>
                    <Text fontSize="13px" fontWeight="600" flexShrink={0}>
                      {formatCurrency(c.total, tenant.currency)}
                    </Text>
                  </Flex>
                ))}
              </Flex>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
}
