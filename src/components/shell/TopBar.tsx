"use client";

import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { Search, Menu } from "lucide-react";
import { mockUser } from "@/data/mock/tenant";

export function TopBar({
  onOpenNav,
  searchValue,
  onSearchChange,
}: {
  onOpenNav?: () => void;
  searchValue: string;
  onSearchChange: (v: string) => void;
}) {
  return (
    <Flex
      align="center"
      gap="12px"
      h="48px"
      px="12px"
      borderBottom="1px solid"
      borderColor="canvas.border"
      bg="white"
      flexShrink={0}
    >
      <IconButton
        aria-label="Abrir navegación"
        icon={<Menu size={18} />}
        variant="ghost"
        size="sm"
        display={{ base: "inline-flex", lg: "none" }}
        onClick={onOpenNav}
      />
      <InputGroup maxW="620px" size="sm">
        <InputLeftElement pointerEvents="none" h="32px">
          <Search size={15} color="#8c959f" />
        </InputLeftElement>
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar contratos, clientes, vehículos..."
          borderColor="canvas.border"
          bg="canvas.subtle"
          h="32px"
          fontSize="13px"
          aria-label="Búsqueda global"
        />
      </InputGroup>

      <Box flex="1" />

      <Flex
        align="center"
        gap="8px"
        px="6px"
        py="3px"
        borderRadius="999px"
        _hover={{ bg: "canvas.subtle" }}
        cursor="default"
      >
        <Flex
          align="center"
          justify="center"
          w="26px"
          h="26px"
          borderRadius="999px"
          bg="fg.default"
          color="white"
          fontSize="12px"
          fontWeight="700"
        >
          {mockUser.initials}
        </Flex>
        <Text fontSize="13px" fontWeight="600" display={{ base: "none", md: "block" }}>
          {mockUser.name}
        </Text>
      </Flex>
    </Flex>
  );
}
