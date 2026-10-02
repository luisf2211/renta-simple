"use client";

import { useToast } from "@chakra-ui/react";
import { useDemoStore } from "@/store/demo-store";
import type { Contract, ContractStatus } from "@/types";

/** Small simulated latency so loading states are demonstrable. */
const wait = (ms = 350) => new Promise((r) => setTimeout(r, ms));

export function customerUrl(contract: Contract): string {
  const base =
    typeof window !== "undefined" ? window.location.origin : "https://app.aybarrentcar.com";
  return `${base}/c/${contract.token}`;
}

export function useContractActions() {
  const { patchContract, appendEvent, tenant } = useDemoStore();
  const toast = useToast();

  async function sendByEmail(contract: Contract) {
    await wait();
    const now = new Date().toISOString();
    const patch: Partial<Contract> =
      contract.status === "DRAFT"
        ? { status: "SENT", sentAt: now }
        : { sentAt: now };
    patchContract(contract.id, patch);
    appendEvent(contract.id, "CONTRACT_SENT", "Christian", "Contrato enviado por email al cliente.");
    toast({ title: "Email simulado correctamente.", status: "success", duration: 2200 });
  }

  function openWhatsApp(contract: Contract, phone: string) {
    const digits = phone.replace(/[^\d]/g, "");
    const msg = encodeURIComponent(
      `Hola, aquí está tu contrato de alquiler ${contract.contractNumber} de ${tenant.businessName}: ${customerUrl(contract)}`,
    );
    const url = `https://wa.me/${digits}?text=${msg}`;
    if (contract.status === "DRAFT") {
      patchContract(contract.id, { status: "SENT", sentAt: new Date().toISOString() });
      appendEvent(contract.id, "CONTRACT_SENT", "Christian", "Contrato compartido por WhatsApp.");
    }
    if (typeof window !== "undefined") window.open(url, "_blank", "noopener");
    toast({ title: "Abriendo WhatsApp...", status: "info", duration: 1800 });
  }

  async function copyLink(contract: Contract) {
    const url = customerUrl(contract);
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
      toast({ title: "Enlace copiado.", status: "success", duration: 1800 });
    } catch {
      toast({ title: url, status: "info", duration: 3000 });
    }
  }

  function changeStatus(
    contract: Contract,
    status: ContractStatus,
    eventType: Parameters<typeof appendEvent>[1],
    description: string,
  ) {
    patchContract(contract.id, { status });
    appendEvent(contract.id, eventType, "Christian", description);
    toast({ title: "Estado actualizado.", status: "success", duration: 1800 });
  }

  function registerDelivery(contract: Contract) {
    changeStatus(contract, "DELIVERED", "CONTRACT_DELIVERED", "Vehículo entregado al cliente.");
  }
  function registerReturn(contract: Contract) {
    changeStatus(contract, "RETURNED", "CONTRACT_RETURNED", "Vehículo devuelto por el cliente.");
  }
  function closeContract(contract: Contract) {
    changeStatus(contract, "CLOSED", "CONTRACT_CLOSED", "Contrato cerrado.");
  }
  function cancelContract(contract: Contract) {
    changeStatus(contract, "CANCELLED", "CONTRACT_CANCELLED", "Contrato cancelado.");
  }

  return {
    sendByEmail,
    openWhatsApp,
    copyLink,
    registerDelivery,
    registerReturn,
    closeContract,
    cancelContract,
  };
}
