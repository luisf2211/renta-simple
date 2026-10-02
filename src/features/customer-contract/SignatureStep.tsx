"use client";

import { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Checkbox,
  Button,
  Image,
  Divider,
  Link as ChakraLink,
  Collapse,
  useToast,
} from "@chakra-ui/react";
import { Lock } from "lucide-react";
import type { Contract, Tenant, Vehicle } from "@/types";
import { SignaturePad } from "./SignaturePad";
import { StepNav } from "./StepNav";
import { formatCurrency, formatDateShort } from "@/lib/formatting/format";
import { calculatePricing } from "@/lib/calculations/pricing";

export function SignatureStep({
  contract,
  vehicle,
  tenant,
  signerName,
  onBack,
  onSign,
}: {
  contract: Contract;
  vehicle: Vehicle;
  tenant: Tenant;
  signerName: string;
  onBack: () => void;
  onSign: (signature: string) => void;
}) {
  const toast = useToast();
  const [accepted, setAccepted] = useState(false);
  const [signature, setSignature] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [signing, setSigning] = useState(false);

  const pricing = calculatePricing({
    billableDays: contract.billableDays,
    dailyRate: contract.dailyRate,
    insuranceAmount: contract.insuranceAmount,
    discountAmount: contract.discountAmount,
    additionalCharges: contract.additionalCharges,
    taxRate: tenant.taxRate ?? 0,
  });

  const canSign = accepted && signature.length > 0;

  const handleSign = async () => {
    if (!canSign) {
      toast({
        title: "Acepta los términos y firma para continuar.",
        status: "warning",
        duration: 2400,
      });
      return;
    }
    setSigning(true);
    await new Promise((r) => setTimeout(r, 450));
    onSign(signature);
  };

  return (
    <Box px="16px" pt="16px" pb="150px">
      <Text fontSize="18px" fontWeight="800">
        Firma del contrato
      </Text>
      <Text fontSize="13px" color="fg.muted" mt="2px" mb="16px">
        Revisa la declaración para completar el proceso.
      </Text>

      <Box bg="canvas.subtle" border="1px solid" borderColor="canvas.border" borderRadius="8px" p="12px" mb="16px">
        <Text fontSize="13px" color="fg.default">
          Confirmo que he revisado la información del contrato{" "}
          <b>{contract.contractNumber}</b> y acepto los términos y condiciones aplicables para
          el alquiler del vehículo.
        </Text>
      </Box>

      <Checkbox
        isChecked={accepted}
        onChange={(e) => setAccepted(e.target.checked)}
        colorScheme="red"
        alignItems="flex-start"
        mb="6px"
      >
        <Text fontSize="13px">He leído y acepto los términos y condiciones.</Text>
      </Checkbox>
      <Box ml="24px" mb="18px">
        <ChakraLink
          fontSize="12px"
          color="brand.600"
          onClick={() => setShowTerms((v) => !v)}
        >
          Ver términos y condiciones
        </ChakraLink>
        <Collapse in={showTerms} animateOpacity>
          <Box mt="8px" maxH="180px" overflowY="auto" pr="4px">
            {tenant.contractTerms.map((t, i) => (
              <Box key={i} mb="8px">
                <Text fontSize="12px" fontWeight="700">
                  {i + 1}. {t.title}
                </Text>
                <Text fontSize="12px" color="fg.muted">
                  {t.body}
                </Text>
              </Box>
            ))}
          </Box>
        </Collapse>
      </Box>

      <Text fontSize="13px" fontWeight="700" mb="6px">
        Tu firma
      </Text>
      <SignaturePad value={signature} onChange={setSignature} />

      <Box mt="12px">
        <Text fontSize="12px" fontWeight="600" mb="2px">
          Nombre completo
        </Text>
        <Box border="1px solid" borderColor="canvas.border" borderRadius="6px" px="12px" py="8px" bg="canvas.subtle">
          <Text fontSize="13px">{signerName}</Text>
        </Box>
        <Text fontSize="11px" color="fg.subtle" mt="6px">
          Esta firma tiene la misma validez legal que una firma manuscrita.
        </Text>
      </Box>

      {/* Contract summary */}
      <Box mt="18px" border="1px solid" borderColor="canvas.border" borderRadius="8px" p="12px">
        <Text fontSize="12px" fontWeight="700" mb="8px">
          Resumen del contrato
        </Text>
        <Flex gap="10px" align="center" mb="10px">
          {vehicle.image && <Image src={vehicle.image} alt="" w="64px" borderRadius="6px" />}
          <Box>
            <Text fontSize="13px" fontWeight="600">
              {vehicle.brand} {vehicle.model} {vehicle.year}
            </Text>
            <Text fontSize="11px" color="fg.muted">
              {vehicle.plate} · {formatDateShort(contract.pickupAt)} → {formatDateShort(contract.returnAt)} · {contract.billableDays} días
            </Text>
          </Box>
        </Flex>
        <Divider mb="8px" />
        <Flex justify="space-between" fontSize="13px" fontWeight="700">
          <Text>Total a pagar</Text>
          <Text color="brand.600">{formatCurrency(pricing.total, tenant.currency)}</Text>
        </Flex>
        <Flex justify="space-between" fontSize="12px" color="fg.muted" mt="2px">
          <Text>Depósito (en la entrega)</Text>
          <Text>{formatCurrency(contract.depositAmount, tenant.currency)}</Text>
        </Flex>
      </Box>

      <Flex align="center" gap="6px" mt="12px" color="fg.subtle">
        <Lock size={12} />
        <Text fontSize="11px">
          Este documento se firma de forma segura. Recibirás una copia por correo.
        </Text>
      </Flex>

      <StepNav
        onBack={onBack}
        onNext={handleSign}
        nextLabel="Firmar contrato"
        nextDisabled={!canSign}
        nextLoading={signing}
      />
    </Box>
  );
}
