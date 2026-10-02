"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Flex, Text, useDisclosure, useToast } from "@chakra-ui/react";
import { FileText } from "lucide-react";
import type { ModuleProps } from "@/components/shell/AppShell";
import { useDemoStore } from "@/store/demo-store";
import { TwoPaneLayout } from "@/components/shell/TwoPaneLayout";
import {
  ContractContextPanel,
  filterContract,
  type ContractFilter,
} from "./ContractContextPanel";
import { ContractWorkspace } from "./ContractWorkspace";
import { ContractEditor } from "./ContractEditor";
import type { Contract } from "@/types";
import { generateId } from "@/lib/signature/verification";

export function ContractsModule({
  globalSearch,
  mobileShowWorkspace,
  setMobileShowWorkspace,
}: ModuleProps) {
  const { contracts, getCustomer, getVehicle, addContract, appendEvent, nextContractNumber } =
    useDemoStore();
  const toast = useToast();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState("");
  const [filter, setFilter] = useState<ContractFilter>("all");
  const editor = useDisclosure();
  const [editingContract, setEditingContract] = useState<Contract | null>(null);

  // Default selection: AR-1058 if present, else first contract.
  useEffect(() => {
    if (selectedId && contracts.some((c) => c.id === selectedId)) return;
    const preferred = contracts.find((c) => c.contractNumber === "AR-1058");
    setSelectedId(preferred?.id ?? contracts[0]?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contracts.length]);

  const effectiveSearch = (localSearch || globalSearch).trim().toLowerCase();

  const filtered = useMemo(() => {
    return contracts.filter((c) => {
      if (!filterContract(c, filter)) return false;
      if (!effectiveSearch) return true;
      const customer = getCustomer(c.customerId);
      const vehicle = getVehicle(c.vehicleId);
      const haystack = [
        c.contractNumber,
        customer?.fullName,
        vehicle?.brand,
        vehicle?.model,
        vehicle?.plate,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(effectiveSearch);
    });
  }, [contracts, filter, effectiveSearch, getCustomer, getVehicle]);

  const selected = contracts.find((c) => c.id === selectedId) ?? null;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setMobileShowWorkspace(true);
  };

  const openNew = () => {
    setEditingContract(null);
    editor.onOpen();
  };
  const openEdit = () => {
    if (selected) {
      setEditingContract(selected);
      editor.onOpen();
    }
  };

  const handleDuplicate = () => {
    if (!selected) return;
    const number = nextContractNumber();
    const now = new Date().toISOString();
    const copy: Contract = {
      ...selected,
      id: generateId("con"),
      contractNumber: number,
      token: `demo-${number.toLowerCase()}`,
      status: "DRAFT",
      createdAt: now,
      sentAt: undefined,
      viewedAt: undefined,
      signedAt: undefined,
      signature: undefined,
      signatureMetadata: undefined,
      signedSnapshot: undefined,
      events: [],
      documents: [],
    };
    addContract(copy);
    appendEvent(copy.id, "CONTRACT_CREATED", "Christian", `Duplicado de ${selected.contractNumber}.`);
    setSelectedId(copy.id);
    toast({ title: `Contrato duplicado como ${number}.`, status: "success", duration: 2200 });
  };

  return (
    <>
      <TwoPaneLayout
        showWorkspaceOnMobile={mobileShowWorkspace}
        onBack={() => setMobileShowWorkspace(false)}
        contextPanel={
          <ContractContextPanel
            contracts={filtered}
            allContracts={contracts}
            search={localSearch}
            onSearchChange={setLocalSearch}
            filter={filter}
            onFilterChange={setFilter}
            selectedId={selectedId}
            onSelect={handleSelect}
            onNew={openNew}
          />
        }
        workspace={
          selected ? (
            <ContractWorkspace
              key={selected.id}
              contract={selected}
              onEdit={openEdit}
              onDuplicate={handleDuplicate}
            />
          ) : (
            <EmptyWorkspace />
          )
        }
      />

      <ContractEditor
        isOpen={editor.isOpen}
        onClose={editor.onClose}
        contract={editingContract}
        onSaved={(id) => {
          setSelectedId(id);
          setMobileShowWorkspace(true);
        }}
      />
    </>
  );
}

function EmptyWorkspace() {
  return (
    <Flex direction="column" align="center" justify="center" h="100%" color="fg.subtle" gap="8px">
      <FileText size={28} />
      <Text fontSize="13px">Selecciona un contrato para ver los detalles.</Text>
    </Flex>
  );
}
