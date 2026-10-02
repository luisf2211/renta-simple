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
import type { Customer } from "@/types";
import { useDemoStore } from "@/store/demo-store";

export function CustomerContextPanel({
  customers,
  selectedId,
  onSelect,
  search,
  onSearchChange,
  onNew,
}: {
  customers: Customer[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  search: string;
  onSearchChange: (v: string) => void;
  onNew: () => void;
}) {
  const { contracts } = useDemoStore();

  return (
    <Flex direction="column" h="100%" minH={0}>
      <Flex align="center" justify="space-between" px="14px" pt="14px" pb="10px">
        <Text fontSize="18px" fontWeight="700">
          Clientes
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

      <Box px="14px" pb="10px">
        <InputGroup size="sm">
          <InputLeftElement pointerEvents="none" h="30px">
            <Search size={14} color="#8c959f" />
          </InputLeftElement>
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar cliente..."
            borderColor="canvas.border"
            fontSize="12px"
            h="30px"
          />
        </InputGroup>
      </Box>

      <Box flex="1" minH={0} overflowY="auto" borderTop="1px solid" borderColor="canvas.border">
        {customers.length === 0 ? (
          <Text fontSize="13px" color="fg.muted" p="20px" textAlign="center">
            Sin resultados.
          </Text>
        ) : (
          customers.map((c) => {
            const count = contracts.filter((ct) => ct.customerId === c.id).length;
            const isSelected = c.id === selectedId;
            return (
              <Flex
                as="button"
                key={c.id}
                onClick={() => onSelect(c.id)}
                direction="column"
                w="100%"
                textAlign="left"
                px="14px"
                py="10px"
                gap="2px"
                borderBottom="1px solid"
                borderColor="canvas.borderMuted"
                borderLeft="2px solid"
                borderLeftColor={isSelected ? "brand.500" : "transparent"}
                bg={isSelected ? "canvas.accent" : "transparent"}
                _hover={{ bg: isSelected ? "canvas.accent" : "canvas.subtle" }}
              >
                <Text fontSize="13px" fontWeight="600">
                  {c.fullName}
                </Text>
                <Text fontSize="12px" color="fg.muted">
                  {c.phone}
                </Text>
                <Text fontSize="11px" color="fg.subtle">
                  {count} {count === 1 ? "contrato" : "contratos"}
                  {!c.isProfileComplete ? " · perfil incompleto" : ""}
                </Text>
              </Flex>
            );
          })
        )}
      </Box>
    </Flex>
  );
}
