"use client";

import {
  Box,
  Flex,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { Plus, Search } from "lucide-react";
import type { Contract, ContractStatus } from "@/types";
import { ContractList } from "./ContractList";

export type ContractFilter = "all" | "pending" | "active" | "closed";

const PENDING: ContractStatus[] = ["DRAFT", "SENT", "VIEWED", "CHANGES_REQUESTED"];
const ACTIVE: ContractStatus[] = ["SIGNED", "DELIVERED"];
const CLOSED: ContractStatus[] = ["RETURNED", "CLOSED", "CANCELLED", "EXPIRED"];

export function filterContract(c: Contract, filter: ContractFilter): boolean {
  if (filter === "all") return true;
  if (filter === "pending") return PENDING.includes(c.status);
  if (filter === "active") return ACTIVE.includes(c.status);
  return CLOSED.includes(c.status);
}

export function ContractContextPanel({
  contracts,
  allContracts,
  search,
  onSearchChange,
  filter,
  onFilterChange,
  selectedId,
  onSelect,
  onNew,
}: {
  contracts: Contract[];
  allContracts: Contract[];
  search: string;
  onSearchChange: (v: string) => void;
  filter: ContractFilter;
  onFilterChange: (f: ContractFilter) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  const counts = {
    all: allContracts.length,
    pending: allContracts.filter((c) => filterContract(c, "pending")).length,
    active: allContracts.filter((c) => filterContract(c, "active")).length,
    closed: allContracts.filter((c) => filterContract(c, "closed")).length,
  };

  const tabs: { key: ContractFilter; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "pending", label: "Pendientes" },
    { key: "active", label: "Activos" },
    { key: "closed", label: "Cerrados" },
  ];

  return (
    <Flex direction="column" h="100%" minH={0}>
      <Flex align="center" justify="space-between" px="14px" pt="14px" pb="10px">
        <Text fontSize="18px" fontWeight="700">
          Contratos
        </Text>
        <Button
          size="sm"
          colorScheme="red"
          bg="brand.500"
          _hover={{ bg: "brand.600" }}
          leftIcon={<Plus size={15} />}
          onClick={onNew}
        >
          Nuevo
        </Button>
      </Flex>

      <Box px="14px" pb="8px">
        <InputGroup size="sm">
          <InputLeftElement pointerEvents="none" h="30px">
            <Search size={14} color="#8c959f" />
          </InputLeftElement>
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por cliente, vehículo, placa o número..."
            borderColor="canvas.border"
            fontSize="12px"
            h="30px"
            aria-label="Buscar contrato"
          />
        </InputGroup>
      </Box>

      <Flex
        gap="2px"
        px="10px"
        borderBottom="1px solid"
        borderColor="canvas.border"
        overflowX="auto"
      >
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
              _hover={{ color: "fg.default" }}
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
        <ContractList
          contracts={contracts}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      </Box>
    </Flex>
  );
}
