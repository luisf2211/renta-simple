"use client";

import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "@/lib/theme";
import { DemoStoreProvider } from "@/store/demo-store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        <DemoStoreProvider>{children}</DemoStoreProvider>
      </ChakraProvider>
    </CacheProvider>
  );
}
