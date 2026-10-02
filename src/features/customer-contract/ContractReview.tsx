"use client";

import { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Image,
  Divider,
  Collapse,
  useToast,
} from "@chakra-ui/react";
import { ChevronRight, ShieldCheck, HelpCircle } from "lucide-react";
import type { Contract, Customer, Tenant, Vehicle } from "@/types";
import { ContractStatusBadge } from "@/components/ui/StatusBadge";
import { AmenityIcon } from "@/components/ui/AmenityIcon";
import {
  formatCurrency,
  formatDate,
  formatTime,
} from "@/lib/formatting/format";
import { TRANSMISSION_LABELS } from "@/types";
import { calculatePricing } from "@/lib/calculations/pricing";

export function ContractReview({
  contract,
  vehicle,
  tenant,
  onContinue,
  onRequestChange,
}: {
  contract: Contract;
  customer: Customer;
  vehicle: Vehicle;
  tenant: Tenant;
  onContinue: () => void;
  onRequestChange: () => void;
}) {
  const [showTerms, setShowTerms] = useState(false);
  const toast = useToast();
  const currency = tenant.currency;
  const pricing = calculatePricing({
    billableDays: contract.billableDays,
    dailyRate: contract.dailyRate,
    insuranceAmount: contract.insuranceAmount,
    discountAmount: contract.discountAmount,
    additionalCharges: contract.additionalCharges,
    taxRate: tenant.taxRate ?? 0,
  });

  return (
    <Box pb="90px">
      <Box px="16px" pt="16px">
        <Text fontSize="18px" fontWeight="800">
          Contrato de alquiler
        </Text>
        <Flex align="center" gap="8px" mt="2px">
          <Text fontSize="15px" fontWeight="700" color="brand.600">
            {contract.contractNumber}
          </Text>
          <ContractStatusBadge status={contract.status} />
        </Flex>
        <Text fontSize="13px" color="fg.muted" mt="6px">
          Revisa la información del contrato antes de completar tus datos y firmar.
        </Text>
      </Box>

      {/* Vehicle */}
      <Flex px="16px" py="16px" gap="12px" align="center">
        {vehicle.image && (
          <Image src={vehicle.image} alt="" w="92px" borderRadius="8px" border="1px solid" borderColor="canvas.border" />
        )}
        <Box>
          <Text fontSize="15px" fontWeight="700">
            {vehicle.brand} {vehicle.model} {vehicle.year}
          </Text>
          <Text fontSize="12px" color="fg.muted">
            {vehicle.plate}
          </Text>
          <Text fontSize="12px" color="fg.muted">
            {vehicle.color} · {TRANSMISSION_LABELS[vehicle.transmission]} · {vehicle.passengers} pasajeros
          </Text>
        </Box>
      </Flex>

      {vehicle.amenities.length > 0 && (
        <Box px="16px" pb="16px">
          <Text fontSize="11px" fontWeight="700" color="fg.muted" textTransform="uppercase" letterSpacing="0.04em" mb="8px">
            Características
          </Text>
          <Flex gap="6px" wrap="wrap">
            {vehicle.amenities.map((a) => (
              <Flex
                key={a.id}
                align="center"
                gap="5px"
                px="8px"
                py="3px"
                bg="canvas.subtle"
                border="1px solid"
                borderColor="canvas.border"
                borderRadius="999px"
                fontSize="12px"
              >
                <Box color="fg.muted">
                  <AmenityIcon name={a.icon} size={13} />
                </Box>
                {a.name}
              </Flex>
            ))}
          </Flex>
        </Box>
      )}

      <Divider />

      {/* Period */}
      <Flex px="16px" py="16px" gap="12px">
        <PeriodBlock
          label="Entrega"
          date={formatDate(contract.pickupAt)}
          time={formatTime(contract.pickupAt)}
          place={contract.pickupLocation}
        />
        <PeriodBlock
          label="Devolución"
          date={formatDate(contract.returnAt)}
          time={formatTime(contract.returnAt)}
          place={contract.returnLocation}
        />
      </Flex>
      <Box px="16px" pb="12px">
        <Text fontSize="12px" color="fg.muted">
          Duración del alquiler: <b>{contract.billableDays} días</b>
        </Text>
      </Box>

      <Divider />

      {/* Pricing */}
      <Box px="16px" py="16px">
        <Text fontSize="12px" fontWeight="700" mb="10px">
          Detalle del alquiler
        </Text>
        <PriceRow
          label={`Tarifa diaria (${contract.billableDays} días)`}
          sub={`${formatCurrency(contract.dailyRate, currency)} / día`}
          value={formatCurrency(pricing.rentalTotal, currency)}
        />
        {contract.insuranceAmount > 0 && (
          <PriceRow label="Seguro" value={formatCurrency(contract.insuranceAmount, currency)} />
        )}
        {contract.additionalCharges.map((c) => (
          <PriceRow key={c.id} label={c.label} value={formatCurrency(c.amount, currency)} />
        ))}
        {contract.discountAmount > 0 && (
          <PriceRow label="Descuento" value={`− ${formatCurrency(contract.discountAmount, currency)}`} />
        )}
        {pricing.taxAmount > 0 && (
          <>
            <PriceRow label="Subtotal" value={formatCurrency(pricing.subtotal, currency)} />
            <PriceRow label="ITBIS (18%)" value={formatCurrency(pricing.taxAmount, currency)} />
          </>
        )}
        <Flex
          justify="space-between"
          align="center"
          mt="10px"
          pt="10px"
          borderTop="2px solid"
          borderColor="canvas.border"
        >
          <Text fontSize="14px" fontWeight="800">
            Total a pagar
          </Text>
          <Text fontSize="18px" fontWeight="800" color="brand.600">
            {formatCurrency(pricing.total, currency)}
          </Text>
        </Flex>
        <Flex
          justify="space-between"
          align="center"
          mt="10px"
          bg="canvas.subtle"
          borderRadius="8px"
          px="12px"
          py="10px"
        >
          <Box>
            <Text fontSize="12px" fontWeight="600">
              Depósito requerido
            </Text>
            <Text fontSize="11px" color="fg.muted">
              Al momento de la entrega
            </Text>
          </Box>
          <Text fontSize="15px" fontWeight="700">
            {formatCurrency(contract.depositAmount, currency)}
          </Text>
        </Flex>
      </Box>

      <Divider />

      {/* Terms summary */}
      <Box px="16px" py="16px">
        <Flex align="center" gap="8px" mb="8px">
          <ShieldCheck size={16} color="#8c959f" />
          <Text fontSize="13px" fontWeight="700">
            Términos y condiciones
          </Text>
        </Flex>
        <Text fontSize="12px" color="fg.muted" mb="8px">
          El presente contrato establece los términos y condiciones para el alquiler del
          vehículo. Revísalos antes de continuar.
        </Text>
        <Button
          size="sm"
          variant="outline"
          w="100%"
          justifyContent="space-between"
          rightIcon={<ChevronRight size={15} style={{ transform: showTerms ? "rotate(90deg)" : "none" }} />}
          onClick={() => setShowTerms((v) => !v)}
        >
          Ver términos completos
        </Button>
        <Collapse in={showTerms} animateOpacity>
          <Box mt="10px" maxH="220px" overflowY="auto" pr="4px">
            {tenant.contractTerms.map((t, i) => (
              <Box key={i} mb="10px">
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

      <Divider />

      <Flex px="16px" py="14px" gap="8px" align="flex-start">
        <HelpCircle size={16} color="#8c959f" />
        <Box>
          <Text fontSize="12px" fontWeight="600">
            ¿Hay algún dato incorrecto?
          </Text>
          <Button
            variant="link"
            size="sm"
            color="brand.600"
            fontSize="12px"
            onClick={() => {
              onRequestChange();
              toast({ title: "Solicitud de corrección enviada.", status: "info", duration: 2200 });
            }}
          >
            Contáctanos para solicitar una corrección
          </Button>
        </Box>
      </Flex>

      {/* Sticky CTA */}
      <Box
        position="fixed"
        bottom="0"
        left="0"
        right="0"
        maxW="480px"
        mx="auto"
        bg="white"
        borderTop="1px solid"
        borderColor="canvas.border"
        p="12px"
        zIndex={20}
      >
        <Button
          w="100%"
          size="md"
          colorScheme="red"
          bg="brand.500"
          _hover={{ bg: "brand.600" }}
          rightIcon={<ChevronRight size={16} />}
          onClick={onContinue}
        >
          Continuar con mis datos
        </Button>
      </Box>
    </Box>
  );
}

function PeriodBlock({
  label,
  date,
  time,
  place,
}: {
  label: string;
  date: string;
  time: string;
  place: string;
}) {
  return (
    <Box flex="1">
      <Text fontSize="11px" color="fg.muted" mb="2px">
        {label}
      </Text>
      <Text fontSize="13px" fontWeight="700">
        {date}
      </Text>
      <Text fontSize="12px" color="fg.default">
        {time}
      </Text>
      <Text fontSize="11px" color="fg.muted" mt="2px">
        {place}
      </Text>
    </Box>
  );
}

function PriceRow({ label, sub, value }: { label: string; sub?: string; value: string }) {
  return (
    <Flex justify="space-between" align="flex-start" py="3px">
      <Box>
        <Text fontSize="13px">{label}</Text>
        {sub && (
          <Text fontSize="11px" color="fg.muted">
            {sub}
          </Text>
        )}
      </Box>
      <Text fontSize="13px" fontWeight="600">
        {value}
      </Text>
    </Flex>
  );
}
