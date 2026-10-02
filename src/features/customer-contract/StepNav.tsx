"use client";

import { Box, Flex, Button } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Sticky bottom Volver / Continuar bar used by the middle customer steps. */
export function StepNav({
  onBack,
  onNext,
  nextLabel = "Continuar",
  nextDisabled,
  nextLoading,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
}) {
  return (
    <Box
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      maxW="480px"
      mx="auto"
      bg="white"
      borderTop="1px solid"
      borderColor="canvas.border"
      p="12px"
      zIndex={20}
    >
      <Flex gap="8px">
        <Button size="md" variant="outline" leftIcon={<ChevronLeft size={16} />} onClick={onBack}>
          Volver
        </Button>
        <Button
          size="md"
          flex="1"
          colorScheme="red"
          bg="brand.500"
          _hover={{ bg: "brand.600" }}
          rightIcon={<ChevronRight size={16} />}
          onClick={onNext}
          isDisabled={nextDisabled}
          isLoading={nextLoading}
        >
          {nextLabel}
        </Button>
      </Flex>
    </Box>
  );
}
