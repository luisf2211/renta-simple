"use client";

import { useEffect } from "react";
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
  Textarea,
  SimpleGrid,
  Flex,
  useToast,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Customer } from "@/types";
import { useDemoStore } from "@/store/demo-store";
import {
  customerEditSchema,
  type CustomerEditValues,
} from "@/schemas/customer.schema";
import { FormField } from "@/components/ui/FormField";
import { generateId } from "@/lib/signature/verification";

export function CustomerEditor({
  isOpen,
  onClose,
  customer,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null; // null = create
  onSaved: (id: string) => void;
}) {
  const { patchCustomer, addCustomer } = useDemoStore();
  const toast = useToast();
  const isEdit = !!customer;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerEditValues>({
    resolver: zodResolver(customerEditSchema),
    defaultValues: toValues(customer),
  });

  useEffect(() => {
    if (isOpen) reset(toValues(customer));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, customer?.id]);

  const onSubmit = handleSubmit((data) => {
    if (isEdit && customer) {
      patchCustomer(customer.id, {
        ...data,
        isProfileComplete:
          !!data.dateOfBirth && !!data.nationality && !!data.licenseNumber,
      });
      toast({ title: "Información actualizada.", status: "success", duration: 1800 });
      onSaved(customer.id);
    } else {
      const id = generateId("cus");
      addCustomer({
        id,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        dateOfBirth: data.dateOfBirth,
        nationality: data.nationality,
        address: data.address,
        city: data.city,
        country: data.country,
        postalCode: data.postalCode,
        licenseNumber: data.licenseNumber,
        licenseCountry: data.licenseCountry,
        licenseExpiration: data.licenseExpiration,
        notes: data.notes,
        isProfileComplete:
          !!data.dateOfBirth && !!data.nationality && !!data.licenseNumber,
        createdAt: new Date().toISOString(),
      });
      toast({ title: "Cliente creado.", status: "success", duration: 1800 });
      onSaved(id);
    }
    onClose();
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px">
          {isEdit ? `Editar ${customer?.fullName}` : "Nuevo cliente"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column" gap="14px">
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing="12px">
              <FormField label="Nombre completo" required error={errors.fullName?.message}>
                <Input {...register("fullName")} />
              </FormField>
              <FormField label="Teléfono" required error={errors.phone?.message}>
                <Input {...register("phone")} />
              </FormField>
            </SimpleGrid>
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing="12px">
              <FormField label="Email" required error={errors.email?.message}>
                <Input {...register("email")} />
              </FormField>
              <FormField label="Fecha de nacimiento" error={errors.dateOfBirth?.message}>
                <Input type="date" {...register("dateOfBirth")} />
              </FormField>
            </SimpleGrid>
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing="12px">
              <FormField label="Nacionalidad" error={errors.nationality?.message}>
                <Input {...register("nationality")} />
              </FormField>
              <FormField label="País" error={errors.country?.message}>
                <Input {...register("country")} />
              </FormField>
            </SimpleGrid>
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing="12px">
              <FormField label="Dirección" error={errors.address?.message}>
                <Input {...register("address")} />
              </FormField>
              <FormField label="Ciudad" error={errors.city?.message}>
                <Input {...register("city")} />
              </FormField>
            </SimpleGrid>
            <SimpleGrid columns={{ base: 1, sm: 3 }} spacing="12px">
              <FormField label="Núm. licencia" error={errors.licenseNumber?.message}>
                <Input {...register("licenseNumber")} />
              </FormField>
              <FormField label="País licencia" error={errors.licenseCountry?.message}>
                <Input {...register("licenseCountry")} />
              </FormField>
              <FormField label="Vence licencia" error={errors.licenseExpiration?.message}>
                <Input type="date" {...register("licenseExpiration")} />
              </FormField>
            </SimpleGrid>
            <FormField label="Notas" error={errors.notes?.message}>
              <Textarea rows={2} {...register("notes")} />
            </FormField>
          </Flex>
        </ModalBody>
        <ModalFooter gap="8px">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            colorScheme="red"
            bg="brand.500"
            _hover={{ bg: "brand.600" }}
            onClick={onSubmit}
            isLoading={isSubmitting}
          >
            {isEdit ? "Guardar" : "Crear"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function toValues(customer: Customer | null): CustomerEditValues {
  return {
    fullName: customer?.fullName ?? "",
    phone: customer?.phone ?? "",
    email: customer?.email ?? "",
    dateOfBirth: customer?.dateOfBirth ?? "",
    nationality: customer?.nationality ?? "",
    address: customer?.address ?? "",
    city: customer?.city ?? "",
    country: customer?.country ?? "",
    postalCode: customer?.postalCode ?? "",
    licenseNumber: customer?.licenseNumber ?? "",
    licenseCountry: customer?.licenseCountry ?? "",
    licenseExpiration: customer?.licenseExpiration ?? "",
    notes: customer?.notes ?? "",
  };
}
