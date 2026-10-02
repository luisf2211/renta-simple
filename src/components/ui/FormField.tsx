"use client";

import { FormControl, FormLabel, FormErrorMessage, Box } from "@chakra-ui/react";

/**
 * Compact labelled form control with inline validation message. Wraps any
 * input-like child so forms stay consistent and accessible.
 */
export function FormField({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel fontSize="12px" fontWeight="600" mb="4px" color="fg.default">
        {label}
        {required && (
          <Box as="span" color="brand.500" ml="2px" aria-hidden>
            *
          </Box>
        )}
      </FormLabel>
      {children}
      {hint && !error && (
        <Box fontSize="11px" color="fg.subtle" mt="4px">
          {hint}
        </Box>
      )}
      <FormErrorMessage fontSize="11px">{error}</FormErrorMessage>
    </FormControl>
  );
}
