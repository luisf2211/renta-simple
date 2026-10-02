"use client";

import { useState } from "react";
import { Box, Flex, Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react";
import type { Contract } from "@/types";
import { useDemoStore } from "@/store/demo-store";
import { ContractHeader } from "./ContractHeader";
import { ContractSummary } from "./ContractSummary";
import { ContractCustomerTab } from "./ContractCustomerTab";
import { ContractVehicleTab } from "./ContractVehicleTab";
import { ContractDocuments } from "./ContractDocuments";
import { ContractActivity } from "./ContractActivity";

export function ContractWorkspace({
  contract,
  onEdit,
  onDuplicate,
}: {
  contract: Contract;
  onEdit: () => void;
  onDuplicate: () => void;
}) {
  const { getCustomer, getVehicle } = useDemoStore();
  const [tabIndex, setTabIndex] = useState(0);
  const customer = getCustomer(contract.customerId);
  const vehicle = getVehicle(contract.vehicleId);

  return (
    <Flex direction="column" h="100%" minH={0}>
      <ContractHeader contract={contract} onEdit={onEdit} onDuplicate={onDuplicate} />

      <Tabs
        index={tabIndex}
        onChange={setTabIndex}
        variant="unstyled"
        display="flex"
        flexDirection="column"
        flex="1"
        minH={0}
      >
        <TabList
          px="20px"
          borderBottom="1px solid"
          borderColor="canvas.border"
          gap="2px"
          overflowX="auto"
          flexShrink={0}
        >
          {["Resumen", "Cliente", "Vehículo", "Documentos", "Actividad"].map((label) => (
            <Tab
              key={label}
              fontSize="13px"
              fontWeight="500"
              color="fg.muted"
              px="10px"
              py="10px"
              borderBottom="2px solid transparent"
              whiteSpace="nowrap"
              _selected={{
                color: "fg.default",
                fontWeight: "600",
                borderColor: "brand.500",
              }}
            >
              {label}
            </Tab>
          ))}
        </TabList>

        <TabPanels flex="1" minH={0} overflowY="auto">
          <TabPanel p="0">
            <ContractSummary contract={contract} onEdit={onEdit} />
          </TabPanel>
          <TabPanel p="0">
            <ContractCustomerTab customer={customer} />
          </TabPanel>
          <TabPanel p="0">
            <ContractVehicleTab vehicle={vehicle} />
          </TabPanel>
          <TabPanel p="0">
            <ContractDocuments contract={contract} />
          </TabPanel>
          <TabPanel p="0">
            <ContractActivity contract={contract} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
}
