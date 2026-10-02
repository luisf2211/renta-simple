"use client";

import { Box, Flex, Text, Button } from "@chakra-ui/react";
import NextLink from "next/link";
import { FileX } from "lucide-react";
import { LogoMark } from "@/components/ui/LogoMark";

export function NotFoundCard({ logo }: { logo: string }) {
  return (
    <Box minH="100dvh" bg="canvas.subtle">
      <Box maxW="480px" mx="auto" bg="white" minH="100dvh">
        <Flex px="16px" py="12px" borderBottom="1px solid" borderColor="canvas.border">
          <LogoMark label={logo} variant="dark" size="sm" />
        </Flex>
        <Flex direction="column" align="center" justify="center" py="80px" px="20px" gap="12px" textAlign="center">
          <FileX size={34} color="#8c959f" />
          <Text fontSize="16px" fontWeight="700">
            Contrato no encontrado
          </Text>
          <Text fontSize="13px" color="fg.muted">
            El enlace no es válido o el contrato ya no está disponible.
          </Text>
          <Button as={NextLink} href="/" size="sm" variant="outline" mt="4px">
            Ir al inicio
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}
