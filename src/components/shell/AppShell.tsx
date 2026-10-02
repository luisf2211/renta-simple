"use client";

import { useState } from "react";
import {
  Box,
  Flex,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  useDisclosure,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { Navigation } from "./Navigation";
import { TopBar } from "./TopBar";
import type { AdminModule } from "./types";
import { useDemoStore } from "@/store/demo-store";
import { ContractsModule } from "@/features/contracts/ContractsModule";
import { CustomersModule } from "@/features/customers/CustomersModule";
import { VehiclesModule } from "@/features/vehicles/VehiclesModule";
import { UsersModule } from "@/features/misc/UsersModule";
import { SettingsModule } from "@/features/misc/SettingsModule";

export interface ModuleProps {
  globalSearch: string;
  mobileShowWorkspace: boolean;
  setMobileShowWorkspace: (v: boolean) => void;
}

export function AppShell() {
  const { ready } = useDemoStore();
  const [active, setActive] = useState<AdminModule>("contracts");
  const [search, setSearch] = useState("");
  const [mobileShowWorkspace, setMobileShowWorkspace] = useState(false);
  const navDrawer = useDisclosure();

  const moduleProps: ModuleProps = {
    globalSearch: search,
    mobileShowWorkspace,
    setMobileShowWorkspace,
  };

  const handleSelectModule = (m: AdminModule) => {
    setActive(m);
    setMobileShowWorkspace(false);
  };

  return (
    <Flex h="100dvh" w="100vw" overflow="hidden" bg="white">
      {/* Fixed sidebar on desktop */}
      <Box
        w="220px"
        flexShrink={0}
        display={{ base: "none", lg: "block" }}
        h="100%"
      >
        <Navigation active={active} onSelect={handleSelectModule} />
      </Box>

      {/* Nav drawer for tablet/mobile */}
      <Drawer
        isOpen={navDrawer.isOpen}
        placement="left"
        onClose={navDrawer.onClose}
      >
        <DrawerOverlay />
        <DrawerContent maxW="240px">
          <Navigation
            active={active}
            onSelect={handleSelectModule}
            onNavigate={navDrawer.onClose}
          />
        </DrawerContent>
      </Drawer>

      <Flex direction="column" flex="1" minW={0} h="100%">
        <TopBar
          onOpenNav={navDrawer.onOpen}
          searchValue={search}
          onSearchChange={setSearch}
        />
        <Box flex="1" minH={0} overflow="hidden">
          {!ready ? (
            <Center h="100%">
              <Spinner size="md" color="brand.500" thickness="2px" />
            </Center>
          ) : active === "contracts" ? (
            <ContractsModule {...moduleProps} />
          ) : active === "customers" ? (
            <CustomersModule {...moduleProps} />
          ) : active === "vehicles" ? (
            <VehiclesModule {...moduleProps} />
          ) : active === "users" ? (
            <UsersModule />
          ) : (
            <SettingsModule />
          )}
        </Box>
      </Flex>
    </Flex>
  );
}
