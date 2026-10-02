"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import {
  FileText,
  Users,
  Car,
  UserCog,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { LogoMark } from "@/components/ui/LogoMark";
import { useDemoStore } from "@/store/demo-store";
import { mockUser } from "@/data/mock/tenant";
import type { AdminModule } from "./types";
import { MODULE_LABELS } from "./types";

const ITEMS: { key: AdminModule; icon: LucideIcon }[] = [
  { key: "contracts", icon: FileText },
  { key: "customers", icon: Users },
  { key: "vehicles", icon: Car },
  { key: "users", icon: UserCog },
  { key: "settings", icon: Settings },
];

export function Navigation({
  active,
  onSelect,
  onNavigate,
}: {
  active: AdminModule;
  onSelect: (m: AdminModule) => void;
  onNavigate?: () => void;
}) {
  const { tenant } = useDemoStore();

  return (
    <Flex
      direction="column"
      h="100%"
      bg="canvas.sidebar"
      color="rgba(255,255,255,0.9)"
      w="100%"
    >
      <Box px="16px" py="16px" borderBottom="1px solid rgba(255,255,255,0.08)">
        <LogoMark label={tenant.logo} imageUrl={tenant.logoUrl} variant="light" size="md" />
      </Box>

      <Box as="nav" flex="1" py="8px" px="8px" overflowY="auto">
        {ITEMS.map(({ key, icon: Icon }) => {
          const isActive = key === active;
          return (
            <Flex
              as="button"
              key={key}
              onClick={() => {
                onSelect(key);
                onNavigate?.();
              }}
              align="center"
              gap="10px"
              w="100%"
              px="10px"
              py="8px"
              mb="2px"
              borderRadius="6px"
              textAlign="left"
              fontSize="13px"
              fontWeight={isActive ? "600" : "500"}
              color={isActive ? "white" : "rgba(255,255,255,0.7)"}
              bg={isActive ? "canvas.sidebarHover" : "transparent"}
              _hover={{ bg: "canvas.sidebarHover", color: "white" }}
              transition="background 0.1s"
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={16} strokeWidth={2} />
              {MODULE_LABELS[key]}
            </Flex>
          );
        })}
      </Box>

      <Flex
        align="center"
        gap="10px"
        px="14px"
        py="12px"
        borderTop="1px solid rgba(255,255,255,0.08)"
      >
        <Flex
          align="center"
          justify="center"
          w="30px"
          h="30px"
          borderRadius="999px"
          bg="brand.500"
          color="white"
          fontSize="13px"
          fontWeight="700"
          flexShrink={0}
        >
          {mockUser.initials}
        </Flex>
        <Box>
          <Text fontSize="13px" fontWeight="600" color="white" lineHeight="1.2">
            {mockUser.name}
          </Text>
          <Text fontSize="11px" color="rgba(255,255,255,0.55)" lineHeight="1.2">
            {mockUser.role}
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
}
