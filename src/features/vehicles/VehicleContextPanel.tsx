"use client";

import {
  Box,
  Flex,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Image,
} from "@chakra-ui/react";
import { Search } from "lucide-react";
import type { Vehicle, VehicleStatus } from "@/types";
import { VehicleStatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency } from "@/lib/formatting/format";
import { useDemoStore } from "@/store/demo-store";

export type VehicleFilter = "all" | "available" | "rented" | "maintenance";

const FILTER_STATUS: Record<Exclude<VehicleFilter, "all">, VehicleStatus> = {
  available: "AVAILABLE",
  rented: "RENTED",
  maintenance: "MAINTENANCE",
};

export function matchVehicleFilter(v: Vehicle, f: VehicleFilter): boolean {
  if (f === "all") return true;
  return v.status === FILTER_STATUS[f];
}

export function VehicleContextPanel({
  vehicles,
  allVehicles,
  selectedId,
  onSelect,
  search,
  onSearchChange,
  filter,
  onFilterChange,
}: {
  vehicles: Vehicle[];
  allVehicles: Vehicle[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  search: string;
  onSearchChange: (v: string) => void;
  filter: VehicleFilter;
  onFilterChange: (f: VehicleFilter) => void;
}) {
  const { tenant } = useDemoStore();

  const tabs: { key: VehicleFilter; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "available", label: "Disponibles" },
    { key: "rented", label: "Rentados" },
    { key: "maintenance", label: "Mantenimiento" },
  ];

  const counts = {
    all: allVehicles.length,
    available: allVehicles.filter((v) => v.status === "AVAILABLE").length,
    rented: allVehicles.filter((v) => v.status === "RENTED").length,
    maintenance: allVehicles.filter((v) => v.status === "MAINTENANCE").length,
  };

  return (
    <Flex direction="column" h="100%" minH={0}>
      <Flex align="center" px="14px" pt="14px" pb="10px">
        <Text fontSize="18px" fontWeight="700">
          Vehículos
        </Text>
      </Flex>

      <Box px="14px" pb="8px">
        <InputGroup size="sm">
          <InputLeftElement pointerEvents="none" h="30px">
            <Search size={14} color="#8c959f" />
          </InputLeftElement>
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por marca, modelo o placa..."
            borderColor="canvas.border"
            fontSize="12px"
            h="30px"
          />
        </InputGroup>
      </Box>

      <Flex gap="2px" px="10px" borderBottom="1px solid" borderColor="canvas.border" overflowX="auto">
        {tabs.map((t) => {
          const isActive = t.key === filter;
          return (
            <Flex
              as="button"
              key={t.key}
              onClick={() => onFilterChange(t.key)}
              align="center"
              gap="6px"
              px="10px"
              py="8px"
              borderBottom="2px solid"
              borderColor={isActive ? "brand.500" : "transparent"}
              color={isActive ? "fg.default" : "fg.muted"}
              fontWeight={isActive ? "600" : "500"}
              fontSize="13px"
              whiteSpace="nowrap"
            >
              {t.label}
              <Box
                as="span"
                fontSize="11px"
                fontWeight="600"
                color={isActive ? "brand.600" : "fg.subtle"}
                bg={isActive ? "brand.50" : "canvas.subtle"}
                borderRadius="999px"
                px="6px"
                minW="18px"
                textAlign="center"
              >
                {counts[t.key]}
              </Box>
            </Flex>
          );
        })}
      </Flex>

      <Box flex="1" minH={0} overflowY="auto">
        {vehicles.length === 0 ? (
          <Text fontSize="13px" color="fg.muted" p="20px" textAlign="center">
            Sin resultados.
          </Text>
        ) : (
          vehicles.map((v) => {
            const isSelected = v.id === selectedId;
            return (
              <Flex
                as="button"
                key={v.id}
                onClick={() => onSelect(v.id)}
                align="center"
                gap="10px"
                w="100%"
                textAlign="left"
                px="14px"
                py="10px"
                borderBottom="1px solid"
                borderColor="canvas.borderMuted"
                borderLeft="2px solid"
                borderLeftColor={isSelected ? "brand.500" : "transparent"}
                bg={isSelected ? "canvas.accent" : "transparent"}
                _hover={{ bg: isSelected ? "canvas.accent" : "canvas.subtle" }}
              >
                {v.image && <Image src={v.image} alt="" w="52px" borderRadius="4px" flexShrink={0} />}
                <Box flex="1" minW={0}>
                  <Text fontSize="13px" fontWeight="600" noOfLines={1}>
                    {v.brand} {v.model} {v.year}
                  </Text>
                  <Text fontSize="12px" color="fg.muted">
                    {v.plate} · {formatCurrency(v.dailyRate, tenant.currency)}/día
                  </Text>
                  <Box mt="3px">
                    <VehicleStatusBadge status={v.status} />
                  </Box>
                </Box>
              </Flex>
            );
          })
        )}
      </Box>
    </Flex>
  );
}
