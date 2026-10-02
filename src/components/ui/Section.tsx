"use client";

import { Box, Flex, Text } from "@chakra-ui/react";

/**
 * Flat titled section with a thin bottom rule under the title — the GitHub-ish
 * density used across the summary panels. No cards.
 */
export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Flex
        align="center"
        justify="space-between"
        borderBottom="1px solid"
        borderColor="canvas.border"
        pb="6px"
        mb="10px"
      >
        <Text fontSize="12px" fontWeight="700" color="fg.default" textTransform="none">
          {title}
        </Text>
        {action}
      </Flex>
      {children}
    </Box>
  );
}

/** Label/value row used inside summary sections. */
export function FieldRow({
  label,
  children,
  mono,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <Flex justify="space-between" gap="16px" py="3px" fontSize="13px">
      <Text color="fg.muted" flexShrink={0}>
        {label}
      </Text>
      <Box
        color="fg.default"
        textAlign="right"
        fontFamily={mono ? "mono" : undefined}
        fontSize={mono ? "12px" : undefined}
      >
        {children}
      </Box>
    </Flex>
  );
}

/** Stacked key/value for the "Entrega / Devolución" style blocks. */
export function StackField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box py="3px">
      <Text fontSize="11px" color="fg.muted" mb="1px">
        {label}
      </Text>
      <Box fontSize="13px" color="fg.default">
        {children}
      </Box>
    </Box>
  );
}
