"use client";

import { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Image,
} from "@chakra-ui/react";
import { Search, Check } from "lucide-react";
import { useDemoStore } from "@/store/demo-store";
import { VehicleStatusBadge } from "@/components/ui/StatusBadge";

export function VehicleSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const { vehicles } = useDemoStore();
  const [query, setQuery] = useState("");

  const selected = vehicles.find((v) => v.id === value);

  const filtered = vehicles.filter((v) =>
    `${v.brand} ${v.model} ${v.year} ${v.plate}`.toLowerCase().includes(query.toLowerCase()),
  );

  if (selected) {
    return (
      <Flex
        align="center"
        justify="space-between"
        border="1px solid"
        borderColor="canvas.border"
        borderRadius="6px"
        px="12px"
        py="8px"
        gap="10px"
      >
        <Flex align="center" gap="10px" minW={0}>
          {selected.image && (
            <Image src={selected.image} alt="" w="48px" borderRadius="4px" flexShrink={0} />
          )}
          <Box minW={0}>
            <Text fontSize="13px" fontWeight="600" noOfLines={1}>
              {selected.brand} {selected.model} {selected.year}
            </Text>
            <Text fontSize="12px" color="fg.muted">
              {selected.plate}
            </Text>
          </Box>
        </Flex>
        <Button size="xs" variant="ghost" onClick={() => onChange("")} flexShrink={0}>
          Cambiar
        </Button>
      </Flex>
    );
  }

  return (
    <Box border="1px solid" borderColor="canvas.border" borderRadius="6px" overflow="hidden">
      <InputGroup size="sm">
        <InputLeftElement pointerEvents="none" h="34px">
          <Search size={14} color="#8c959f" />
        </InputLeftElement>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar vehículo..."
          border="none"
          borderBottom="1px solid"
          borderColor="canvas.borderMuted"
          borderRadius="0"
          h="34px"
          _focus={{ boxShadow: "none" }}
        />
      </InputGroup>
      <Box maxH="220px" overflowY="auto">
        {filtered.length === 0 ? (
          <Text fontSize="12px" color="fg.muted" px="12px" py="10px">
            Sin resultados.
          </Text>
        ) : (
          filtered.map((v) => (
            <Flex
              as="button"
              key={v.id}
              w="100%"
              textAlign="left"
              align="center"
              gap="10px"
              px="12px"
              py="8px"
              borderBottom="1px solid"
              borderColor="canvas.borderMuted"
              _hover={{ bg: "canvas.subtle" }}
              onClick={() => onChange(v.id)}
            >
              {v.image && <Image src={v.image} alt="" w="44px" borderRadius="4px" flexShrink={0} />}
              <Box flex="1" minW={0}>
                <Text fontSize="13px" fontWeight="500" noOfLines={1}>
                  {v.brand} {v.model} {v.year}
                </Text>
                <Text fontSize="11px" color="fg.muted">
                  {v.plate}
                </Text>
              </Box>
              <VehicleStatusBadge status={v.status} />
              {value === v.id && <Check size={15} color="#1a7f37" />}
            </Flex>
          ))
        )}
      </Box>
    </Box>
  );
}
