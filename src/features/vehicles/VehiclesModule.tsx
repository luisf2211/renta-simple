"use client";

import { useEffect, useMemo, useState } from "react";
import { Flex, Text, useDisclosure, useToast } from "@chakra-ui/react";
import { Car } from "lucide-react";
import type { ModuleProps } from "@/components/shell/AppShell";
import { useDemoStore } from "@/store/demo-store";
import { TwoPaneLayout } from "@/components/shell/TwoPaneLayout";
import {
  VehicleContextPanel,
  matchVehicleFilter,
  type VehicleFilter,
} from "./VehicleContextPanel";
import { VehicleWorkspace } from "./VehicleWorkspace";
import { VehicleEditor } from "./VehicleEditor";
import { ContractEditor } from "@/features/contracts/ContractEditor";

export function VehiclesModule({
  globalSearch,
  mobileShowWorkspace,
  setMobileShowWorkspace,
}: ModuleProps) {
  const { vehicles } = useDemoStore();
  const toast = useToast();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState("");
  const [filter, setFilter] = useState<VehicleFilter>("all");
  const vehicleEditor = useDisclosure();
  const contractEditor = useDisclosure();

  useEffect(() => {
    if (selectedId && vehicles.some((v) => v.id === selectedId)) return;
    setSelectedId(vehicles[0]?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicles.length]);

  const search = (localSearch || globalSearch).trim().toLowerCase();
  const filtered = useMemo(
    () =>
      vehicles.filter(
        (v) =>
          matchVehicleFilter(v, filter) &&
          `${v.brand} ${v.model} ${v.year} ${v.plate}`.toLowerCase().includes(search),
      ),
    [vehicles, filter, search],
  );

  const selected = vehicles.find((v) => v.id === selectedId) ?? null;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setMobileShowWorkspace(true);
  };

  return (
    <>
      <TwoPaneLayout
        showWorkspaceOnMobile={mobileShowWorkspace}
        onBack={() => setMobileShowWorkspace(false)}
        contextPanel={
          <VehicleContextPanel
            vehicles={filtered}
            allVehicles={vehicles}
            selectedId={selectedId}
            onSelect={handleSelect}
            search={localSearch}
            onSearchChange={setLocalSearch}
            filter={filter}
            onFilterChange={setFilter}
          />
        }
        workspace={
          selected ? (
            <VehicleWorkspace
              key={selected.id}
              vehicle={selected}
              onEdit={() => vehicleEditor.onOpen()}
              onNewContract={() => contractEditor.onOpen()}
            />
          ) : (
            <Flex direction="column" align="center" justify="center" h="100%" color="fg.subtle" gap="8px">
              <Car size={28} />
              <Text fontSize="13px">Selecciona un vehículo.</Text>
            </Flex>
          )
        }
      />

      {selected && (
        <VehicleEditor
          isOpen={vehicleEditor.isOpen}
          onClose={vehicleEditor.onClose}
          vehicle={selected}
          onSaved={(id) => setSelectedId(id)}
        />
      )}

      <ContractEditor
        isOpen={contractEditor.isOpen}
        onClose={contractEditor.onClose}
        contract={null}
        prefillVehicleId={selected?.id}
        onSaved={() =>
          toast({
            title: "Contrato creado. Revísalo en el módulo Contratos.",
            status: "success",
            duration: 2600,
          })
        }
      />
    </>
  );
}
