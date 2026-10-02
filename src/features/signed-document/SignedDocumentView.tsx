"use client";

import { useEffect, useMemo } from "react";
import {
  Box,
  Flex,
  Button,
  Text,
  Center,
  Spinner,
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { useDemoStore } from "@/store/demo-store";
import { SignedContractDocument } from "./SignedContractDocument";
import { NotFoundCard } from "@/features/customer-contract/NotFoundCard";
import { buildSignedSnapshot } from "@/lib/signature/snapshot";
import type { SignedSnapshot } from "@/types";

export function SignedDocumentView({ token }: { token: string }) {
  const { ready, getContractByToken, getCustomer, getVehicle, tenant } = useDemoStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldPrint = searchParams.get("print") === "1";

  const contract = getContractByToken(token);
  const customer = contract ? getCustomer(contract.customerId) : undefined;
  const vehicle = contract ? getVehicle(contract.vehicleId) : undefined;

  // Prefer the immutable snapshot; fall back to a live-built one only if the
  // contract is signed but (unexpectedly) lacks a snapshot.
  const snapshot: SignedSnapshot | null = useMemo(() => {
    if (!contract) return null;
    if (contract.signedSnapshot) return contract.signedSnapshot;
    if (
      contract.status === "SIGNED" &&
      contract.signature &&
      customer &&
      vehicle
    ) {
      return buildSignedSnapshot({
        contract,
        customer,
        vehicle,
        tenant,
        customerSignature: contract.signature,
      }).snapshot;
    }
    return null;
  }, [contract, customer, vehicle, tenant]);

  const verifyUrl = useMemo(() => {
    const base =
      typeof window !== "undefined" ? window.location.origin : "https://app.aybarrentcar.com";
    const id = snapshot?.signature.verificationId ?? "";
    return `${base}/verify/${id}`;
  }, [snapshot]);

  useEffect(() => {
    if (ready && shouldPrint && snapshot) {
      const t = setTimeout(() => window.print(), 600);
      return () => clearTimeout(t);
    }
  }, [ready, shouldPrint, snapshot]);

  if (!ready) {
    return (
      <Center minH="100dvh">
        <Spinner color="brand.500" thickness="2px" />
      </Center>
    );
  }

  if (!contract) {
    return <NotFoundCard logo={tenant.logo} />;
  }

  if (!snapshot) {
    return (
      <Center minH="100dvh" flexDirection="column" gap="12px" p="20px" textAlign="center">
        <Text fontSize="15px" fontWeight="700">
          Este contrato aún no ha sido firmado
        </Text>
        <Text fontSize="13px" color="fg.muted">
          El documento firmado estará disponible una vez el cliente complete la firma.
        </Text>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<ArrowLeft size={14} />}
          onClick={() => router.push(`/c/${token}`)}
        >
          Volver al contrato
        </Button>
      </Center>
    );
  }

  return (
    <Box bg="canvas.subtle" minH="100dvh" className="print-root">
      {/* Toolbar — hidden on print */}
      <Flex
        className="no-print"
        align="center"
        justify="space-between"
        px="16px"
        py="10px"
        bg="white"
        borderBottom="1px solid"
        borderColor="canvas.border"
        position="sticky"
        top="0"
        zIndex={10}
      >
        <Button
          size="sm"
          variant="ghost"
          leftIcon={<ArrowLeft size={15} />}
          onClick={() => router.push(`/c/${token}`)}
        >
          Volver
        </Button>
        <Text fontSize="13px" fontWeight="600" color="fg.muted">
          Contrato {contract.contractNumber}
        </Text>
        <Button
          size="sm"
          colorScheme="red"
          bg="brand.500"
          _hover={{ bg: "brand.600" }}
          leftIcon={<Printer size={15} />}
          onClick={() => window.print()}
        >
          Imprimir / PDF
        </Button>
      </Flex>

      <Box py={{ base: "0", md: "24px" }} px={{ base: "0", md: "16px" }}>
        <SignedContractDocument
          snapshot={snapshot}
          contractNumber={contract.contractNumber}
          verifyUrl={verifyUrl}
        />
      </Box>
    </Box>
  );
}
