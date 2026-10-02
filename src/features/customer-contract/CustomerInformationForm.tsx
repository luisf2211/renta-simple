"use client";

import { Box, Flex, Text, Input, Select, SimpleGrid } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Customer } from "@/types";
import {
  customerInfoSchema,
  type CustomerInfoValues,
} from "@/schemas/customer.schema";
import { FormField } from "@/components/ui/FormField";
import { StepNav } from "./StepNav";

const NATIONALITIES = [
  "Dominicana",
  "Estadounidense",
  "Española",
  "Mexicana",
  "Colombiana",
  "Venezolana",
  "Otra",
];

export function CustomerInformationForm({
  customer,
  onBack,
  onSubmit,
}: {
  customer: Customer;
  onBack: () => void;
  onSubmit: (values: CustomerInfoValues) => void;
}) {
  const isReturning = customer.isProfileComplete;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerInfoValues>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: {
      fullName: customer.fullName ?? "",
      dateOfBirth: customer.dateOfBirth ?? "",
      nationality: customer.nationality || "Dominicana",
      phone: customer.phone ?? "",
      email: customer.email ?? "",
      address: customer.address ?? "",
      city: customer.city ?? "",
      postalCode: customer.postalCode ?? "",
      country: customer.country || "República Dominicana",
    },
  });

  const submit = handleSubmit(onSubmit);

  return (
    <Box px="16px" pt="16px" pb="90px">
      <Text fontSize="18px" fontWeight="800">
        Tus datos
      </Text>
      <Text fontSize="13px" color="fg.muted" mt="2px" mb="18px">
        {isReturning
          ? "Confirma que tu información sea correcta antes de firmar."
          : "Completa tu información para firmar el contrato."}
      </Text>

      <Text fontSize="12px" fontWeight="700" color="fg.muted" mb="10px" textTransform="uppercase" letterSpacing="0.04em">
        Información personal
      </Text>
      <Flex direction="column" gap="12px" mb="20px">
        <FormField label="Nombre completo" required error={errors.fullName?.message}>
          <Input {...register("fullName")} />
        </FormField>
        <SimpleGrid columns={2} spacing="10px">
          <FormField label="Fecha de nacimiento" required error={errors.dateOfBirth?.message}>
            <Input type="date" {...register("dateOfBirth")} />
          </FormField>
          <FormField label="Nacionalidad" required error={errors.nationality?.message}>
            <Select {...register("nationality")}>
              {NATIONALITIES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
          </FormField>
        </SimpleGrid>
      </Flex>

      <Text fontSize="12px" fontWeight="700" color="fg.muted" mb="10px" textTransform="uppercase" letterSpacing="0.04em">
        Contacto
      </Text>
      <Flex direction="column" gap="12px" mb="20px">
        <FormField label="Teléfono" required error={errors.phone?.message}>
          <Input {...register("phone")} placeholder="+1 809..." />
        </FormField>
        <FormField label="Email" required error={errors.email?.message}>
          <Input {...register("email")} type="email" />
        </FormField>
      </Flex>

      <Text fontSize="12px" fontWeight="700" color="fg.muted" mb="10px" textTransform="uppercase" letterSpacing="0.04em">
        Dirección (opcional)
      </Text>
      <Flex direction="column" gap="12px">
        <FormField label="Dirección" error={errors.address?.message}>
          <Input {...register("address")} placeholder="Calle, número, sector..." />
        </FormField>
        <SimpleGrid columns={2} spacing="10px">
          <FormField label="Ciudad" error={errors.city?.message}>
            <Input {...register("city")} />
          </FormField>
          <FormField label="Código postal" error={errors.postalCode?.message}>
            <Input {...register("postalCode")} />
          </FormField>
        </SimpleGrid>
      </Flex>

      <StepNav onBack={onBack} onNext={submit} />
    </Box>
  );
}
