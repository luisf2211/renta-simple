"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { DOC } from "./docStyles";
import { LogoMark } from "@/components/ui/LogoMark";
import type { BusinessSnapshot } from "@/types";

/** Section header: uppercase label with a red underline rule. */
export function DocSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text
      fontSize="11px"
      fontWeight="800"
      letterSpacing="0.06em"
      color={DOC.ink}
      textTransform="uppercase"
      borderBottom={`2px solid ${DOC.red}`}
      pb="3px"
      mb="8px"
    >
      {children}
    </Text>
  );
}

/** Compact label / value stacked field used throughout the document. */
export function DocField({
  label,
  children,
  mono,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <Box mb="6px">
      <Text fontSize="9px" color={DOC.muted} textTransform="uppercase" letterSpacing="0.03em">
        {label}
      </Text>
      <Text fontSize="11px" color={DOC.ink} fontFamily={mono ? "mono" : undefined}>
        {children}
      </Text>
    </Box>
  );
}

export function DocPageHeader({
  business,
  compact,
  contractNumber,
  pageLabel,
}: {
  business: BusinessSnapshot;
  compact?: boolean;
  contractNumber: string;
  pageLabel: string;
}) {
  return (
    <Flex
      justify="space-between"
      align="flex-start"
      borderBottom={`2px solid ${DOC.red}`}
      pb="10px"
      mb="14px"
    >
      <LogoMark label={business.logo} variant="dark" size={compact ? "md" : "lg"} />
      <Box textAlign="right">
        {compact ? (
          <>
            <Text fontSize="13px" fontWeight="800" color={DOC.ink}>
              {contractNumber}
            </Text>
            <Text fontSize="9px" color={DOC.muted}>
              Contrato de alquiler de vehículo
            </Text>
            <Text fontSize="9px" color={DOC.muted}>
              {pageLabel}
            </Text>
          </>
        ) : (
          <>
            <Text fontSize="10px" fontWeight="600" color={DOC.ink}>
              {business.businessName}
            </Text>
            <Text fontSize="9px" color={DOC.muted}>
              {business.address}
            </Text>
            <Text fontSize="9px" color={DOC.muted}>
              {business.phone}
            </Text>
            {business.website && (
              <Text fontSize="9px" color={DOC.muted}>
                {business.website}
              </Text>
            )}
          </>
        )}
      </Box>
    </Flex>
  );
}

export function DocFooter({
  contractNumber,
  signedLabel,
  pageLabel,
}: {
  contractNumber: string;
  signedLabel?: string;
  pageLabel: string;
}) {
  return (
    <Flex
      justify="space-between"
      align="center"
      borderTop={`1px solid ${DOC.ruleMuted}`}
      pt="6px"
      mt="14px"
      fontSize="8px"
      color={DOC.subtle}
    >
      <Text>
        Contrato {contractNumber}
        {signedLabel ? ` · ${signedLabel}` : ""}
      </Text>
      <Text>{pageLabel}</Text>
    </Flex>
  );
}
