"use client";

import { useEffect, useMemo, useState } from "react";
import { Flex, Text, useDisclosure, useToast } from "@chakra-ui/react";
import { Users } from "lucide-react";
import type { ModuleProps } from "@/components/shell/AppShell";
import { useDemoStore } from "@/store/demo-store";
import { TwoPaneLayout } from "@/components/shell/TwoPaneLayout";
import { CustomerContextPanel } from "./CustomerContextPanel";
import { CustomerWorkspace } from "./CustomerWorkspace";
import { CustomerEditor } from "./CustomerEditor";
import { ContractEditor } from "@/features/contracts/ContractEditor";
import type { Customer } from "@/types";

export function CustomersModule({
  globalSearch,
  mobileShowWorkspace,
  setMobileShowWorkspace,
}: ModuleProps) {
  const { customers } = useDemoStore();
  const toast = useToast();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState("");
  const customerEditor = useDisclosure();
  const contractEditor = useDisclosure();
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    if (selectedId && customers.some((c) => c.id === selectedId)) return;
    setSelectedId(customers[0]?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customers.length]);

  const search = (localSearch || globalSearch).trim().toLowerCase();
  const filtered = useMemo(
    () =>
      customers.filter((c) =>
        `${c.fullName} ${c.phone} ${c.email}`.toLowerCase().includes(search),
      ),
    [customers, search],
  );

  const selected = customers.find((c) => c.id === selectedId) ?? null;

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
          <CustomerContextPanel
            customers={filtered}
            selectedId={selectedId}
            onSelect={handleSelect}
            search={localSearch}
            onSearchChange={setLocalSearch}
            onNew={() => {
              setEditingCustomer(null);
              customerEditor.onOpen();
            }}
          />
        }
        workspace={
          selected ? (
            <CustomerWorkspace
              key={selected.id}
              customer={selected}
              onEdit={() => {
                setEditingCustomer(selected);
                customerEditor.onOpen();
              }}
              onNewContract={() => contractEditor.onOpen()}
              onOpenContract={() =>
                toast({
                  title: "Abre el contrato desde el módulo Contratos.",
                  status: "info",
                  duration: 2200,
                })
              }
            />
          ) : (
            <Flex direction="column" align="center" justify="center" h="100%" color="fg.subtle" gap="8px">
              <Users size={28} />
              <Text fontSize="13px">Selecciona un cliente.</Text>
            </Flex>
          )
        }
      />

      <CustomerEditor
        isOpen={customerEditor.isOpen}
        onClose={customerEditor.onClose}
        customer={editingCustomer}
        onSaved={(id) => {
          setSelectedId(id);
          setMobileShowWorkspace(true);
        }}
      />

      <ContractEditor
        isOpen={contractEditor.isOpen}
        onClose={contractEditor.onClose}
        contract={null}
        prefillCustomerId={selected?.id}
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
