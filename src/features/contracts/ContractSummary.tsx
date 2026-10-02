"use client";

import { Box, Flex, Text, SimpleGrid, Divider } from "@chakra-ui/react";
import type { Contract } from "@/types";
import { useDemoStore } from "@/store/demo-store";
import { Section, FieldRow, StackField } from "@/components/ui/Section";
import {
  formatCurrency,
  formatDate,
  formatTime,
} from "@/lib/formatting/format";
import { TRANSMISSION_LABELS } from "@/types";
import { calculatePricing } from "@/lib/calculations/pricing";
import { ContractStatusBadge } from "@/components/ui/StatusBadge";

export function ContractSummary({
  contract,
  onEdit,
}: {
  contract: Contract;
  onEdit: () => void;
}) {
  const { getCustomer, getVehicle, tenant } = useDemoStore();
  const customer = getCustomer(contract.customerId);
  const vehicle = getVehicle(contract.vehicleId);
  const currency = tenant.currency;

  const pricing = calculatePricing({
    billableDays: contract.billableDays,
    dailyRate: contract.dailyRate,
    insuranceAmount: contract.insuranceAmount,
    discountAmount: contract.discountAmount,
    additionalCharges: contract.additionalCharges,
    taxRate: tenant.taxRate ?? 0,
  });

  const EditLink = (
    <Text
      as="button"
      fontSize="12px"
      color="brand.600"
      fontWeight="600"
      onClick={onEdit}
      _hover={{ textDecoration: "underline" }}
    >
      Editar
    </Text>
  );

  return (
    <SimpleGrid columns={{ base: 1, xl: 2 }} spacing="28px" p="20px">
      {/* Left column */}
      <Flex direction="column" gap="22px">
        <Section title="Cliente" action={EditLink}>
          <Box fontSize="13px">
            <Text fontWeight="600" mb="4px">
              {customer?.fullName ?? "—"}
            </Text>
            <FieldRow label="Teléfono">{customer?.phone ?? "—"}</FieldRow>
            <FieldRow label="Email">{customer?.email ?? "—"}</FieldRow>
            <FieldRow label="Licencia">{customer?.licenseNumber || "—"}</FieldRow>
            <FieldRow label="Vence">
              {customer?.licenseExpiration ? formatDate(customer.licenseExpiration) : "—"}
            </FieldRow>
          </Box>
        </Section>

        <Section title="Vehículo" action={EditLink}>
          <FieldRow label="Marca / Modelo">
            {vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : "—"}
          </FieldRow>
          <FieldRow label="Placa">{vehicle?.plate ?? "—"}</FieldRow>
          <FieldRow label="Color">{vehicle?.color ?? "—"}</FieldRow>
          <FieldRow label="Transmisión">
            {vehicle ? TRANSMISSION_LABELS[vehicle.transmission] : "—"}
          </FieldRow>
          <FieldRow label="Pasajeros">{vehicle?.passengers ?? "—"}</FieldRow>
        </Section>

        <Section title="Período de alquiler" action={EditLink}>
          <SimpleGrid columns={2} spacing="10px">
            <StackField label="Fecha de entrega">
              {formatDate(contract.pickupAt)} · {formatTime(contract.pickupAt)}
            </StackField>
            <StackField label="Fecha de devolución">
              {formatDate(contract.returnAt)} · {formatTime(contract.returnAt)}
            </StackField>
          </SimpleGrid>
          <FieldRow label="Duración">{contract.billableDays} días</FieldRow>
        </Section>

        <Section title="Tarifas y cargos" action={EditLink}>
          <FieldRow label={`Tarifa diaria (${contract.billableDays} días)`}>
            <Text fontWeight="600">{formatCurrency(pricing.rentalTotal, currency)}</Text>
            <Text fontSize="11px" color="fg.muted">
              {formatCurrency(contract.dailyRate, currency)} / día
            </Text>
          </FieldRow>
          {contract.insuranceAmount > 0 && (
            <FieldRow label="Seguro">{formatCurrency(contract.insuranceAmount, currency)}</FieldRow>
          )}
          {contract.additionalCharges.map((ch) => (
            <FieldRow key={ch.id} label={ch.label}>
              {formatCurrency(ch.amount, currency)}
            </FieldRow>
          ))}
          {contract.discountAmount > 0 && (
            <FieldRow label="Descuento">
              <Text color="#1a7f37">− {formatCurrency(contract.discountAmount, currency)}</Text>
            </FieldRow>
          )}
          {pricing.taxAmount > 0 && (
            <>
              <Divider my="8px" />
              <FieldRow label="Subtotal">{formatCurrency(pricing.subtotal, currency)}</FieldRow>
              <FieldRow label="ITBIS (18%)">{formatCurrency(pricing.taxAmount, currency)}</FieldRow>
            </>
          )}
          <Divider my="8px" />
          <FieldRow label="Depósito (reembolsable)">
            {formatCurrency(contract.depositAmount, currency)}
          </FieldRow>
          <Flex
            justify="space-between"
            align="center"
            mt="8px"
            pt="8px"
            borderTop="2px solid"
            borderColor="canvas.border"
          >
            <Text fontSize="14px" fontWeight="700" color="brand.600">
              Total a pagar
            </Text>
            <Text fontSize="16px" fontWeight="800" color="brand.600">
              {formatCurrency(pricing.total, currency)}
            </Text>
          </Flex>
        </Section>
      </Flex>

      {/* Right column */}
      <Flex direction="column" gap="22px">
        <Section title="Notas" action={EditLink}>
          <Text fontSize="13px" color={contract.notes ? "fg.default" : "fg.subtle"} whiteSpace="pre-wrap">
            {contract.notes || "Sin notas."}
          </Text>
        </Section>

        <Section title="Ubicación de entrega">
          <StackField label="Entrega">{contract.pickupLocation}</StackField>
          <StackField label="Devolución">{contract.returnLocation}</StackField>
        </Section>

        <Section title="Estado">
          <Box mb="8px">
            <ContractStatusBadge status={contract.status} size="md" />
          </Box>
          <Text fontSize="12px" color="fg.muted">
            {statusHint(contract.status)}
          </Text>
        </Section>
      </Flex>
    </SimpleGrid>
  );
}

function statusHint(status: Contract["status"]): string {
  switch (status) {
    case "DRAFT":
      return "El contrato está en borrador. Puedes editarlo y enviarlo cuando esté listo.";
    case "SENT":
      return "Se ha generado el contrato y está listo para ser enviado al cliente para su firma digital.";
    case "VIEWED":
      return "El cliente abrió el contrato pero aún no lo ha firmado.";
    case "CHANGES_REQUESTED":
      return "El cliente solicitó una corrección antes de firmar.";
    case "SIGNED":
      return "El contrato fue firmado por el cliente. Puedes registrar la entrega del vehículo.";
    case "DELIVERED":
      return "El vehículo fue entregado al cliente. Registra la devolución al finalizar.";
    case "RETURNED":
      return "El vehículo fue devuelto. Puedes cerrar el contrato.";
    case "CLOSED":
      return "El contrato está cerrado.";
    case "CANCELLED":
      return "El contrato fue cancelado.";
    case "EXPIRED":
      return "El contrato expiró sin firma.";
    default:
      return "";
  }
}
