"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import type { Contract } from "@/types";
import { useDemoStore } from "@/store/demo-store";
import { ContractStatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatDateShort } from "@/lib/formatting/format";

export function ContractList({
  contracts,
  selectedId,
  onSelect,
}: {
  contracts: Contract[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { getCustomer, getVehicle, tenant } = useDemoStore();

  if (contracts.length === 0) {
    return (
      <Box p="24px" textAlign="center">
        <Text fontSize="13px" color="fg.muted">
          No se encontraron contratos.
        </Text>
      </Box>
    );
  }

  return (
    <Box role="listbox" aria-label="Contratos">
      {contracts.map((c) => {
        const customer = getCustomer(c.customerId);
        const vehicle = getVehicle(c.vehicleId);
        const isSelected = c.id === selectedId;
        return (
          <Flex
            as="button"
            role="option"
            aria-selected={isSelected}
            key={c.id}
            onClick={() => onSelect(c.id)}
            direction="column"
            w="100%"
            textAlign="left"
            px="14px"
            py="11px"
            gap="4px"
            borderBottom="1px solid"
            borderColor="canvas.borderMuted"
            borderLeft="2px solid"
            borderLeftColor={isSelected ? "brand.500" : "transparent"}
            bg={isSelected ? "canvas.accent" : "transparent"}
            _hover={{ bg: isSelected ? "canvas.accent" : "canvas.subtle" }}
            transition="background 0.08s"
          >
            <Flex justify="space-between" align="center" w="100%" gap="8px">
              <Text fontSize="13px" fontWeight="700" color="fg.default">
                {c.contractNumber}
              </Text>
              <ContractStatusBadge status={c.status} />
            </Flex>
            <Text fontSize="13px" color="fg.default" noOfLines={1}>
              {customer?.fullName ?? "—"}
            </Text>
            <Flex justify="space-between" align="center" w="100%" gap="8px">
              <Text fontSize="12px" color="fg.muted" noOfLines={1}>
                {vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : "—"}
              </Text>
              <Text fontSize="13px" fontWeight="600" color="fg.default" flexShrink={0}>
                {formatCurrency(c.total, tenant.currency)}
              </Text>
            </Flex>
            <Text fontSize="11px" color="fg.subtle">
              {formatDateShort(c.pickupAt)} → {formatDateShort(c.returnAt)}
            </Text>
          </Flex>
        );
      })}
    </Box>
  );
}
