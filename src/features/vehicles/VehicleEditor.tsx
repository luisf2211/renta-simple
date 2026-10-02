"use client";

import { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Input,
  Select,
  SimpleGrid,
  Flex,
  InputGroup,
  InputLeftAddon,
  Divider,
  useToast,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import type { Vehicle, VehicleStatus, Transmission } from "@/types";
import { useDemoStore } from "@/store/demo-store";
import { FormField } from "@/components/ui/FormField";
import { Section } from "@/components/ui/Section";
import { VEHICLE_STATUS_LABELS, TRANSMISSION_LABELS } from "@/types";
import { VehiclePhotosManager } from "./VehiclePhotosManager";
import { VehicleAmenitiesPicker } from "./VehicleAmenitiesPicker";

interface VehicleFormValues {
  brand: string;
  model: string;
  year: number;
  plate: string;
  vin: string;
  color: string;
  transmission: Transmission;
  passengers: number;
  fleetNumber: string;
  status: VehicleStatus;
  dailyRate: number;
}

export function VehicleEditor({
  isOpen,
  onClose,
  vehicle,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle; // vehicles are always edited (fleet is fixed in prototype)
  onSaved: (id: string) => void;
}) {
  const { patchVehicle, setVehicleAmenities, dataSource } = useDemoStore();
  const toast = useToast();
  const isSupabase = dataSource === "supabase";
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(vehicle.amenityIds);

  const { register, handleSubmit, reset } = useForm<VehicleFormValues>({
    defaultValues: toValues(vehicle),
  });

  useEffect(() => {
    if (isOpen) {
      reset(toValues(vehicle));
      setSelectedAmenities(vehicle.amenityIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, vehicle.id]);

  const onSubmit = handleSubmit(async (data) => {
    patchVehicle(vehicle.id, {
      ...data,
      year: Number(data.year),
      passengers: Number(data.passengers),
      dailyRate: Number(data.dailyRate),
    });
    await setVehicleAmenities(vehicle.id, selectedAmenities);
    toast({ title: "Vehículo actualizado.", status: "success", duration: 1800 });
    onSaved(vehicle.id);
    onClose();
  });

  const toggleAmenity = (id: string, checked: boolean) =>
    setSelectedAmenities((prev) =>
      checked ? [...new Set([...prev, id])] : prev.filter((x) => x !== id),
    );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px">
          Editar {vehicle.brand} {vehicle.model}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column" gap="14px">
            <SimpleGrid columns={{ base: 1, sm: 3 }} spacing="12px">
              <FormField label="Marca">
                <Input {...register("brand")} />
              </FormField>
              <FormField label="Modelo">
                <Input {...register("model")} />
              </FormField>
              <FormField label="Año">
                <Input type="number" {...register("year")} />
              </FormField>
            </SimpleGrid>
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing="12px">
              <FormField label="Placa">
                <Input {...register("plate")} />
              </FormField>
              <FormField label="VIN">
                <Input {...register("vin")} />
              </FormField>
            </SimpleGrid>
            <SimpleGrid columns={{ base: 1, sm: 3 }} spacing="12px">
              <FormField label="Color">
                <Input {...register("color")} />
              </FormField>
              <FormField label="Transmisión">
                <Select {...register("transmission")}>
                  {(Object.keys(TRANSMISSION_LABELS) as Transmission[]).map((t) => (
                    <option key={t} value={t}>
                      {TRANSMISSION_LABELS[t]}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Pasajeros">
                <Input type="number" {...register("passengers")} />
              </FormField>
            </SimpleGrid>
            <SimpleGrid columns={{ base: 1, sm: 3 }} spacing="12px">
              <FormField label="Flota">
                <Input {...register("fleetNumber")} />
              </FormField>
              <FormField label="Estado">
                <Select {...register("status")}>
                  {(Object.keys(VEHICLE_STATUS_LABELS) as VehicleStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {VEHICLE_STATUS_LABELS[s]}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Tarifa diaria">
                <InputGroup size="sm">
                  <InputLeftAddon px="8px" fontSize="12px">
                    US$
                  </InputLeftAddon>
                  <Input type="number" step="0.01" {...register("dailyRate")} />
                </InputGroup>
              </FormField>
            </SimpleGrid>

            {isSupabase && (
              <>
                <Divider />
                <VehiclePhotosManager vehicle={vehicle} />

                <Divider />
                <Section title="Amenidades">
                  <VehicleAmenitiesPicker
                    selectedIds={selectedAmenities}
                    onToggle={toggleAmenity}
                  />
                </Section>
              </>
            )}
          </Flex>
        </ModalBody>
        <ModalFooter gap="8px">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button colorScheme="red" bg="brand.500" _hover={{ bg: "brand.600" }} onClick={onSubmit}>
            Guardar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function toValues(v: Vehicle): VehicleFormValues {
  return {
    brand: v.brand,
    model: v.model,
    year: v.year,
    plate: v.plate,
    vin: v.vin,
    color: v.color,
    transmission: v.transmission,
    passengers: v.passengers,
    fleetNumber: v.fleetNumber,
    status: v.status,
    dailyRate: v.dailyRate,
  };
}
