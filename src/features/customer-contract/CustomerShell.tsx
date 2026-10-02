"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { Check } from "lucide-react";
import { LogoMark } from "@/components/ui/LogoMark";

export type CustomerStep = "review" | "info" | "document" | "signature" | "done";

const STEPS: { key: CustomerStep; label: string }[] = [
  { key: "review", label: "Revisar" },
  { key: "info", label: "Tus datos" },
  { key: "document", label: "Documento" },
  { key: "signature", label: "Firma" },
];

/**
 * Mobile-first chrome for the customer flow: fixed logo header with a language
 * selector and a numbered progress indicator. Centered with a sensible max
 * width on larger screens (never stretched across a wide monitor).
 */
export function CustomerShell({
  logo,
  logoUrl,
  step,
  showProgress = true,
  children,
}: {
  logo: string;
  logoUrl?: string;
  step: CustomerStep;
  showProgress?: boolean;
  children: React.ReactNode;
}) {
  const currentIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <Box minH="100dvh" bg="canvas.subtle">
      <Box maxW="480px" mx="auto" bg="white" minH="100dvh" boxShadow={{ md: "0 0 0 1px #e4e8ec" }}>
        <Flex
          as="header"
          align="center"
          justify="space-between"
          px="16px"
          py="12px"
          borderBottom="1px solid"
          borderColor="canvas.border"
          position="sticky"
          top="0"
          bg="white"
          zIndex={10}
        >
          <LogoMark label={logo} imageUrl={logoUrl} variant="dark" size="sm" />
          <Flex
            as="span"
            align="center"
            gap="4px"
            fontSize="12px"
            color="fg.muted"
            border="1px solid"
            borderColor="canvas.border"
            borderRadius="6px"
            px="8px"
            py="3px"
          >
            ES
          </Flex>
        </Flex>

        {showProgress && (
          <Flex
            align="center"
            px="16px"
            py="12px"
            gap="4px"
            borderBottom="1px solid"
            borderColor="canvas.borderMuted"
          >
            {STEPS.map((s, i) => {
              const done = i < currentIndex;
              const active = i === currentIndex;
              return (
                <Flex key={s.key} align="center" flex={i < STEPS.length - 1 ? "1" : "0"}>
                  <Flex align="center" gap="6px" flexShrink={0}>
                    <Flex
                      align="center"
                      justify="center"
                      w="22px"
                      h="22px"
                      borderRadius="999px"
                      fontSize="11px"
                      fontWeight="700"
                      bg={active || done ? "brand.500" : "canvas.subtle"}
                      color={active || done ? "white" : "fg.subtle"}
                      border={active || done ? "none" : "1px solid"}
                      borderColor="canvas.border"
                    >
                      {done ? <Check size={13} /> : i + 1}
                    </Flex>
                    <Text
                      fontSize="11px"
                      fontWeight={active ? "700" : "500"}
                      color={active ? "fg.default" : "fg.subtle"}
                      display={{ base: active ? "block" : "none", sm: "block" }}
                      whiteSpace="nowrap"
                    >
                      {s.label}
                    </Text>
                  </Flex>
                  {i < STEPS.length - 1 && (
                    <Box flex="1" h="1px" bg={done ? "brand.500" : "canvas.border"} mx="6px" minW="10px" />
                  )}
                </Flex>
              );
            })}
          </Flex>
        )}

        <Box>{children}</Box>
      </Box>
    </Box>
  );
}
