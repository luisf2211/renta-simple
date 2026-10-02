"use client";

import { Box, Flex, Text, Image, SimpleGrid, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import { Check } from "lucide-react";
import type { SignedSnapshot } from "@/types";
import { DOC, A4 } from "./docStyles";
import { DocSectionTitle, DocField, DocPageHeader, DocFooter } from "./DocComponents";
import { TRANSMISSION_LABELS } from "@/types";
import {
  formatCurrency,
  formatDate,
  formatDateLong,
  formatDateTimeNumeric,
  formatTime,
} from "@/lib/formatting/format";

export function SignedContractPageOne({
  snapshot,
  contractNumber,
}: {
  snapshot: SignedSnapshot;
  contractNumber: string;
}) {
  const { business, customer, vehicle, pricing, period } = snapshot;
  const currency = pricing.currency;
  const rentalTotal = pricing.billableDays * pricing.dailyRate;

  return (
    <Box
      className="print-page"
      bg={DOC.pageBg}
      color={DOC.ink}
      w={{ base: "100%", md: A4.width }}
      minH={{ md: A4.minHeight }}
      mx="auto"
      p={{ base: "20px", md: "16mm" }}
      boxShadow={{ base: "none", md: "0 1px 4px rgba(0,0,0,0.12)" }}
      fontSize="11px"
    >
      <DocPageHeader
        business={business}
        contractNumber={contractNumber}
        pageLabel="Página 1 de 2"
      />

      {/* Title + signed badge */}
      <Flex justify="space-between" align="flex-start" mb="16px">
        <Box>
          <Text fontSize="17px" fontWeight="800" lineHeight="1.1">
            CONTRATO DE ALQUILER DE VEHÍCULO
          </Text>
          <Text fontSize="15px" fontWeight="700" color={DOC.red}>
            {contractNumber}
          </Text>
        </Box>
        <Box textAlign="right">
          <Flex
            as="span"
            align="center"
            gap="5px"
            bg={DOC.greenBg}
            color={DOC.green}
            border={`1px solid ${DOC.green}`}
            borderRadius="999px"
            px="10px"
            py="3px"
            fontSize="10px"
            fontWeight="700"
            display="inline-flex"
          >
            <Check size={12} /> FIRMADO
          </Flex>
          <Text fontSize="9px" color={DOC.muted} mt="4px">
            {formatDateLong(snapshot.signature.signedAt)} · {formatTime(snapshot.signature.signedAt)}
          </Text>
          <Text fontSize="8px" color={DOC.subtle}>
            Documento firmado digitalmente
          </Text>
        </Box>
      </Flex>

      {/* Arrendatario + Documento */}
      <SimpleGrid columns={2} spacing="20px" mb="16px">
        <Box>
          <DocSectionTitle>Arrendatario</DocSectionTitle>
          <DocField label="Nombre completo">{customer.fullName}</DocField>
          <DocField label="Teléfono">{customer.phone}</DocField>
          <DocField label="Email">{customer.email}</DocField>
          <DocField label="Fecha de nacimiento">{formatDate(customer.dateOfBirth)}</DocField>
          <DocField label="Nacionalidad">{customer.nationality}</DocField>
          <DocField label="Dirección">
            {[customer.address, customer.city, customer.country].filter(Boolean).join(", ")}
          </DocField>
        </Box>

        <Box>
          <DocSectionTitle>Documento de identidad</DocSectionTitle>
          <Flex gap="8px" mb="8px" wrap="wrap">
            {customer.licenseFrontImage && (
              <Image
                src={customer.licenseFrontImage.dataUrl}
                alt="Licencia frontal"
                w="150px"
                borderRadius="4px"
                border={`1px solid ${DOC.rule}`}
              />
            )}
            {customer.licenseBackImage && (
              <Image
                src={customer.licenseBackImage.dataUrl}
                alt="Licencia posterior"
                w="150px"
                borderRadius="4px"
                border={`1px solid ${DOC.rule}`}
              />
            )}
            {!customer.licenseFrontImage && customer.passportImage && (
              <Image
                src={customer.passportImage.dataUrl}
                alt="Pasaporte"
                w="150px"
                borderRadius="4px"
                border={`1px solid ${DOC.rule}`}
              />
            )}
          </Flex>
          <SimpleGrid columns={2} spacing="6px">
            <DocField label="Número de licencia">{customer.licenseNumber || "—"}</DocField>
            <DocField label="País emisor">{customer.licenseCountry || "—"}</DocField>
          </SimpleGrid>
          <DocField label="Fecha de vencimiento">
            {customer.licenseExpiration ? formatDate(customer.licenseExpiration) : "—"}
          </DocField>
        </Box>
      </SimpleGrid>

      {/* Vehículo */}
      <Box mb="16px">
        <DocSectionTitle>Vehículo</DocSectionTitle>
        <Flex gap="16px">
          {vehicle.image && (
            <Image
              src={vehicle.image}
              alt=""
              w="150px"
              h="94px"
              objectFit="cover"
              borderRadius="4px"
              border={`1px solid ${DOC.rule}`}
            />
          )}
          <SimpleGrid columns={2} spacing="4px 24px" flex="1">
            <DocField label="Marca / Modelo">
              {vehicle.brand} {vehicle.model} {vehicle.year}
            </DocField>
            <DocField label="Placa">{vehicle.plate}</DocField>
            <DocField label="Color">{vehicle.color}</DocField>
            <DocField label="Transmisión">{TRANSMISSION_LABELS[vehicle.transmission]}</DocField>
            <DocField label="Pasajeros">{vehicle.passengers}</DocField>
            <DocField label="VIN" mono>
              {vehicle.vin}
            </DocField>
          </SimpleGrid>
        </Flex>
        {vehicle.amenities && vehicle.amenities.length > 0 && (
          <Box mt="8px">
            <Text fontSize="9px" color={DOC.muted} textTransform="uppercase" letterSpacing="0.03em" mb="2px">
              Amenidades
            </Text>
            <Text fontSize="10px" color={DOC.ink}>
              {vehicle.amenities.join(" · ")}
            </Text>
          </Box>
        )}
      </Box>

      {/* Período */}
      <Box mb="16px">
        <DocSectionTitle>Período del alquiler</DocSectionTitle>
        <SimpleGrid columns={3} spacing="16px">
          <Box>
            <DocField label="Fecha de entrega">
              {formatDateLong(period.pickupAt)}
            </DocField>
            <Text fontSize="10px">{formatTime(period.pickupAt)}</Text>
            <Text fontSize="9px" color={DOC.muted}>
              {period.pickupLocation}
            </Text>
          </Box>
          <Box>
            <DocField label="Fecha de devolución">
              {formatDateLong(period.returnAt)}
            </DocField>
            <Text fontSize="10px">{formatTime(period.returnAt)}</Text>
            <Text fontSize="9px" color={DOC.muted}>
              {period.returnLocation}
            </Text>
          </Box>
          <Box>
            <DocField label="Duración">{period.billableDays} días</DocField>
          </Box>
        </SimpleGrid>
      </Box>

      {/* Cargos */}
      <Box mb="16px">
        <DocSectionTitle>Detalle de cargos</DocSectionTitle>
        <Table size="sm" variant="unstyled">
          <Thead>
            <Tr borderBottom={`1px solid ${DOC.rule}`}>
              <Th fontSize="9px" color={DOC.muted} px="0" py="4px">Concepto</Th>
              <Th fontSize="9px" color={DOC.muted} py="4px">Cantidad / Tarifa</Th>
              <Th fontSize="9px" color={DOC.muted} py="4px" isNumeric>Total</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr borderBottom={`1px solid ${DOC.ruleMuted}`}>
              <Td fontSize="10px" px="0" py="4px">Tarifa diaria</Td>
              <Td fontSize="10px" py="4px">
                {period.billableDays} días × {formatCurrency(pricing.dailyRate, currency)}
              </Td>
              <Td fontSize="10px" py="4px" isNumeric>{formatCurrency(rentalTotal, currency)}</Td>
            </Tr>
            {pricing.insuranceAmount > 0 && (
              <Tr borderBottom={`1px solid ${DOC.ruleMuted}`}>
                <Td fontSize="10px" px="0" py="4px">Seguro</Td>
                <Td fontSize="10px" py="4px">{formatCurrency(pricing.insuranceAmount, currency)}</Td>
                <Td fontSize="10px" py="4px" isNumeric>{formatCurrency(pricing.insuranceAmount, currency)}</Td>
              </Tr>
            )}
            {pricing.additionalCharges.map((ch) => (
              <Tr key={ch.id} borderBottom={`1px solid ${DOC.ruleMuted}`}>
                <Td fontSize="10px" px="0" py="4px">{ch.label}</Td>
                <Td fontSize="10px" py="4px">—</Td>
                <Td fontSize="10px" py="4px" isNumeric>{formatCurrency(ch.amount, currency)}</Td>
              </Tr>
            ))}
            {pricing.discountAmount > 0 && (
              <Tr borderBottom={`1px solid ${DOC.ruleMuted}`}>
                <Td fontSize="10px" px="0" py="4px">Descuento</Td>
                <Td fontSize="10px" py="4px">—</Td>
                <Td fontSize="10px" py="4px" isNumeric>− {formatCurrency(pricing.discountAmount, currency)}</Td>
              </Tr>
            )}
          </Tbody>
        </Table>

        {pricing.taxAmount > 0 && (
          <>
            <Flex justify="space-between" px="10px" py="2px" mt="4px">
              <Text fontSize="10px" color={DOC.muted}>Subtotal</Text>
              <Text fontSize="10px">{formatCurrency(pricing.subtotal, currency)}</Text>
            </Flex>
            <Flex justify="space-between" px="10px" py="2px">
              <Text fontSize="10px" color={DOC.muted}>ITBIS (18%)</Text>
              <Text fontSize="10px">{formatCurrency(pricing.taxAmount, currency)}</Text>
            </Flex>
          </>
        )}
        <Flex justify="space-between" align="center" bg={DOC.subtleBg} borderRadius="4px" px="10px" py="6px" mt="8px">
          <Text fontSize="12px" fontWeight="800">Total a pagar</Text>
          <Text fontSize="14px" fontWeight="800" color={DOC.red}>
            {formatCurrency(pricing.total, currency)}
          </Text>
        </Flex>
        <Flex justify="space-between" align="center" px="10px" py="4px">
          <Text fontSize="10px" color={DOC.muted}>Depósito requerido (al momento de la entrega)</Text>
          <Text fontSize="11px" fontWeight="700">{formatCurrency(pricing.depositAmount, currency)}</Text>
        </Flex>
      </Box>

      {/* Observaciones */}
      {snapshot.notes && (
        <Box mb="12px" bg={DOC.subtleBg} borderRadius="4px" p="10px">
          <Text fontSize="9px" fontWeight="800" color={DOC.muted} textTransform="uppercase" mb="3px">
            Observaciones
          </Text>
          <Text fontSize="10px" color={DOC.ink} whiteSpace="pre-wrap">
            {snapshot.notes}
          </Text>
        </Box>
      )}

      <DocFooter
        contractNumber={contractNumber}
        signedLabel={`Firmado el ${formatDateTimeNumeric(snapshot.signature.signedAt)}`}
        pageLabel="Página 1 de 2"
      />
    </Box>
  );
}
