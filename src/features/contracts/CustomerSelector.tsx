"use client";

import { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  useToast,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Plus, Check, UserPlus } from "lucide-react";
import { useDemoStore } from "@/store/demo-store";
import type { Customer } from "@/types";
import { quickCustomerSchema, type QuickCustomerValues } from "@/schemas/customer.schema";
import { generateId } from "@/lib/signature/verification";
import { FormField } from "@/components/ui/FormField";

export function CustomerSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const { customers, addCustomer } = useDemoStore();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuickCustomerValues>({
    resolver: zodResolver(quickCustomerSchema),
    defaultValues: { fullName: "", phone: "", email: "" },
  });

  const selected = customers.find((c) => c.id === value);

  const filtered = customers.filter((c) =>
    `${c.fullName} ${c.phone} ${c.email}`.toLowerCase().includes(query.toLowerCase()),
  );

  const onCreate = handleSubmit((data) => {
    const now = new Date().toISOString();
    const customer: Customer = {
      id: generateId("cus"),
      fullName: data.fullName,
      phone: data.phone,
      email: data.email || "",
      dateOfBirth: "",
      nationality: "",
      address: "",
      city: "",
      country: "República Dominicana",
      licenseNumber: "",
      licenseCountry: "",
      licenseExpiration: "",
      isProfileComplete: false,
      createdAt: now,
    };
    addCustomer(customer);
    onChange(customer.id);
    reset();
    setCreating(false);
    toast({ title: "Cliente creado.", status: "success", duration: 1800 });
  });

  if (selected) {
    return (
      <Flex
        align="center"
        justify="space-between"
        border="1px solid"
        borderColor="canvas.border"
        borderRadius="6px"
        px="12px"
        py="8px"
      >
        <Box>
          <Text fontSize="13px" fontWeight="600">
            {selected.fullName}
          </Text>
          <Text fontSize="12px" color="fg.muted">
            {selected.phone}
            {selected.email ? ` · ${selected.email}` : ""}
          </Text>
        </Box>
        <Button size="xs" variant="ghost" onClick={() => onChange("")}>
          Cambiar
        </Button>
      </Flex>
    );
  }

  return (
    <Box border="1px solid" borderColor="canvas.border" borderRadius="6px" overflow="hidden">
      {!creating ? (
        <>
          <InputGroup size="sm">
            <InputLeftElement pointerEvents="none" h="34px">
              <Search size={14} color="#8c959f" />
            </InputLeftElement>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar cliente..."
              border="none"
              borderBottom="1px solid"
              borderColor="canvas.borderMuted"
              borderRadius="0"
              h="34px"
              _focus={{ boxShadow: "none" }}
            />
          </InputGroup>
          <Box maxH="180px" overflowY="auto">
            {filtered.length === 0 ? (
              <Text fontSize="12px" color="fg.muted" px="12px" py="10px">
                Sin resultados.
              </Text>
            ) : (
              filtered.map((c) => (
                <Flex
                  as="button"
                  key={c.id}
                  w="100%"
                  textAlign="left"
                  align="center"
                  justify="space-between"
                  px="12px"
                  py="8px"
                  borderBottom="1px solid"
                  borderColor="canvas.borderMuted"
                  _hover={{ bg: "canvas.subtle" }}
                  onClick={() => onChange(c.id)}
                >
                  <Box>
                    <Text fontSize="13px" fontWeight="500">
                      {c.fullName}
                    </Text>
                    <Text fontSize="11px" color="fg.muted">
                      {c.phone}
                    </Text>
                  </Box>
                  {value === c.id && <Check size={15} color="#1a7f37" />}
                </Flex>
              ))
            )}
          </Box>
          <Button
            w="100%"
            size="sm"
            variant="ghost"
            borderRadius="0"
            borderTop="1px solid"
            borderColor="canvas.borderMuted"
            leftIcon={<Plus size={14} />}
            justifyContent="flex-start"
            onClick={() => setCreating(true)}
          >
            Crear cliente
          </Button>
        </>
      ) : (
        <Box p="12px">
          <Flex align="center" gap="6px" mb="10px">
            <UserPlus size={15} />
            <Text fontSize="13px" fontWeight="600">
              Nuevo cliente
            </Text>
          </Flex>
          <Flex direction="column" gap="10px">
            <FormField label="Nombre" required error={errors.fullName?.message}>
              <Input {...register("fullName")} placeholder="Nombre completo" />
            </FormField>
            <FormField label="Teléfono" required error={errors.phone?.message}>
              <Input {...register("phone")} placeholder="+1 809..." />
            </FormField>
            <FormField label="Email" error={errors.email?.message}>
              <Input {...register("email")} placeholder="opcional" />
            </FormField>
            <Text fontSize="11px" color="fg.subtle">
              El cliente podrá completar el resto de su información al firmar.
            </Text>
            <Flex gap="8px" justify="flex-end">
              <Button size="sm" variant="ghost" onClick={() => { setCreating(false); reset(); }}>
                Cancelar
              </Button>
              <Button
                size="sm"
                colorScheme="red"
                bg="brand.500"
                _hover={{ bg: "brand.600" }}
                onClick={onCreate}
                isLoading={isSubmitting}
              >
                Crear
              </Button>
            </Flex>
          </Flex>
        </Box>
      )}
    </Box>
  );
}
