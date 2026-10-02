"use client";

import { Box, Flex, Text, Image } from "@chakra-ui/react";
import type { Vehicle } from "@/types";
import { Section, FieldRow } from "@/components/ui/Section";
import { TRANSMISSION_LABELS } from "@/types";
import { VehicleStatusBadge } from "@/components/ui/StatusBadge";
import { AmenityIcon } from "@/components/ui/AmenityIcon";

export function ContractVehicleTab({ vehicle }: { vehicle?: Vehicle }) {
  if (!vehicle) {
    return (
      <Box p="20px">
        <Text fontSize="13px" color="fg.muted">
          Sin vehículo asociado.
        </Text>
      </Box>
    );
  }

  return (
    <Box p="20px" maxW="640px">
      <Flex gap="16px" mb="22px" align="center">
        {vehicle.image && (
          <Image
            src={vehicle.image}
            alt={`${vehicle.brand} ${vehicle.model}`}
            w="160px"
            borderRadius="8px"
            border="1px solid"
            borderColor="canvas.border"
          />
        )}
        <Box>
          <Text fontSize="15px" fontWeight="700">
            {vehicle.brand} {vehicle.model} {vehicle.year}
          </Text>
          <Text fontSize="13px" color="fg.muted" mb="8px">
            {vehicle.plate}
          </Text>
          <VehicleStatusBadge status={vehicle.status} />
        </Box>
      </Flex>

      {vehicle.photos.length > 1 && (
        <Flex gap="8px" wrap="wrap" mb="22px">
          {vehicle.photos.slice(1).map((p) => (
            <Image
              key={p.id}
              src={p.url}
              alt=""
              w="120px"
              h="78px"
              objectFit="cover"
              borderRadius="6px"
              border="1px solid"
              borderColor="canvas.border"
            />
          ))}
        </Flex>
      )}

      <Box mb="22px">
        <Section title="Especificaciones">
          <FieldRow label="Placa">{vehicle.plate}</FieldRow>
          <FieldRow label="VIN" mono>{vehicle.vin}</FieldRow>
          <FieldRow label="Color">{vehicle.color}</FieldRow>
          <FieldRow label="Transmisión">{TRANSMISSION_LABELS[vehicle.transmission]}</FieldRow>
          <FieldRow label="Pasajeros">{vehicle.passengers}</FieldRow>
          <FieldRow label="Flota">{vehicle.fleetNumber}</FieldRow>
        </Section>
      </Box>

      {vehicle.amenities.length > 0 && (
        <Section title="Amenidades">
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
        </Section>
      )}
    </Box>
  );
}
