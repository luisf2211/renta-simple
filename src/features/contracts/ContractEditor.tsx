"use client";

import { useEffect } from "react";
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerCloseButton,
  Box,
  Flex,
  Text,
  Input,
  Textarea,
  Button,
  SimpleGrid,
  InputGroup,
  InputLeftAddon,
  IconButton,
  Divider,
  useToast,
} from "@chakra-ui/react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import type { Contract } from "@/types";
import { useDemoStore } from "@/store/demo-store";
import {
  contractEditorSchema,
  type ContractEditorValues,
} from "@/schemas/contract.schema";
import { FormField } from "@/components/ui/FormField";
import { CustomerSelector } from "./CustomerSelector";
import { VehicleSelector } from "./VehicleSelector";
import { LocationSelect } from "./LocationSelect";
import {
  calculateBillableDays,
  calculatePricing,
} from "@/lib/calculations/pricing";
import {
  formatCurrency,
  toDatetimeLocal,
  fromDatetimeLocal,
} from "@/lib/formatting/format";
import { generateId } from "@/lib/signature/verification";
import { useContractActions } from "./useContractActions";

export function ContractEditor({
  isOpen,
  onClose,
  contract,
  prefillCustomerId,
  prefillVehicleId,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null; // null = create
  prefillCustomerId?: string;
  prefillVehicleId?: string;
  onSaved: (id: string) => void;
}) {
  const {
    tenant,
    getVehicle,
    addContract,
    patchContract,
    appendEvent,
    nextContractNumber,
    dataSource,
  } = useDemoStore();
  const toast = useToast();
  const actions = useContractActions();
  const isEdit = !!contract;

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ContractEditorValues>({
    resolver: zodResolver(contractEditorSchema),
    defaultValues: emptyValues(),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "additionalCharges",
  });

  // Reset form whenever the drawer opens for a different target.
  useEffect(() => {
    if (!isOpen) return;
    if (contract) {
      reset({
        customerId: contract.customerId,
        vehicleId: contract.vehicleId,
        pickupAt: toDatetimeLocal(contract.pickupAt),
        returnAt: toDatetimeLocal(contract.returnAt),
        pickupLocation: contract.pickupLocation,
        returnLocation: contract.returnLocation,
        dailyRate: contract.dailyRate,
        insuranceAmount: contract.insuranceAmount,
        depositAmount: contract.depositAmount,
        discountAmount: contract.discountAmount,
        additionalCharges: contract.additionalCharges,
        notes: contract.notes ?? "",
      });
    } else {
      reset(emptyValues(prefillCustomerId, prefillVehicleId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, contract?.id, prefillCustomerId, prefillVehicleId]);

  const values = watch();
  const billableDays = calculateBillableDays(
    fromDatetimeLocal(values.pickupAt || ""),
    fromDatetimeLocal(values.returnAt || ""),
  );
  const pricing = calculatePricing({
    billableDays,
    dailyRate: Number(values.dailyRate) || 0,
    insuranceAmount: Number(values.insuranceAmount) || 0,
    discountAmount: Number(values.discountAmount) || 0,
    additionalCharges: (values.additionalCharges || []).map((c) => ({
      ...c,
      amount: Number(c.amount) || 0,
    })),
    taxRate: tenant.taxRate ?? 0,
  });

  // When a vehicle is selected on a fresh contract, default the daily rate.
  function handleVehicleChange(id: string) {
    setValue("vehicleId", id, { shouldValidate: true });
    const v = getVehicle(id);
    if (v && (!isEdit || !values.dailyRate)) {
      setValue("dailyRate", v.dailyRate);
    }
  }

  function buildContractFromValues(
    data: ContractEditorValues,
    status: Contract["status"],
  ): Contract {
    const pickupIso = fromDatetimeLocal(data.pickupAt);
    const returnIso = fromDatetimeLocal(data.returnAt);
    const days = calculateBillableDays(pickupIso, returnIso);
    const charges = data.additionalCharges.map((c) => ({
      id: c.id || generateId("chg"),
      label: c.label,
      amount: Number(c.amount) || 0,
    }));
    const p = calculatePricing({
      taxRate: tenant.taxRate ?? 0,
      billableDays: days,
      dailyRate: data.dailyRate,
      insuranceAmount: data.insuranceAmount,
      discountAmount: data.discountAmount,
      additionalCharges: charges,
    });
    const now = new Date().toISOString();
    const number = contract?.contractNumber ?? nextContractNumber();

    return {
      id: contract?.id ?? generateId("con"),
      contractNumber: number,
      token: contract?.token ?? `demo-${number.toLowerCase()}`,
      customerId: data.customerId,
      vehicleId: data.vehicleId,
      status,
      pickupAt: pickupIso,
      returnAt: returnIso,
      pickupLocation: data.pickupLocation,
      returnLocation: data.returnLocation,
      billableDays: days,
      dailyRate: data.dailyRate,
      insuranceAmount: data.insuranceAmount,
      depositAmount: data.depositAmount,
      discountAmount: data.discountAmount,
      additionalCharges: charges,
      subtotal: p.subtotal,
      taxAmount: p.taxAmount,
      total: p.total,
      notes: data.notes,
      createdAt: contract?.createdAt ?? now,
      sentAt: contract?.sentAt,
      viewedAt: contract?.viewedAt,
      signedAt: contract?.signedAt,
      signature: contract?.signature,
      signatureMetadata: contract?.signatureMetadata,
      signedSnapshot: contract?.signedSnapshot,
      events: contract?.events ?? [],
      documents: contract?.documents ?? [],
    };
  }

  const save = (andSend: boolean) =>
    handleSubmit(async (data) => {
      if (isEdit && contract) {
        const next = buildContractFromValues(data, contract.status);
        patchContract(contract.id, next);
        appendEvent(contract.id, "CONTRACT_EDITED", "Christian", "Contrato actualizado.");
        toast({ title: "Contrato guardado.", status: "success", duration: 1800 });
        onSaved(contract.id);
        onClose();
        return;
      }

      // Create: adopt the real contract returned by the store (real id/token).
      const draft = buildContractFromValues(data, "DRAFT");
      let created = draft;
      try {
        created = await addContract(draft);
      } catch {
        toast({ title: "No se pudo crear el contrato.", status: "error", duration: 2600 });
        return;
      }

      // In mock mode the server doesn't log the creation event; do it locally.
      if (dataSource !== "supabase") {
        appendEvent(created.id, "CONTRACT_CREATED", "Christian", "Contrato creado.");
      }

      if (andSend) {
        void actions.sendByEmail(created);
      } else {
        toast({ title: "Borrador guardado.", status: "success", duration: 1800 });
      }
      onSaved(created.id);
      onClose();
    })();

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="lg">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottom="1px solid" borderColor="canvas.border" fontSize="16px">
          {isEdit ? `Editar ${contract?.contractNumber}` : "Nuevo contrato"}
        </DrawerHeader>

        <DrawerBody>
          <Flex direction="column" gap="18px" py="4px">
            <FormField label="Cliente" required error={errors.customerId?.message}>
              <Controller
                control={control}
                name="customerId"
                render={({ field }) => (
                  <CustomerSelector value={field.value} onChange={field.onChange} />
                )}
              />
            </FormField>

            <FormField label="Vehículo" required error={errors.vehicleId?.message}>
              <Controller
                control={control}
                name="vehicleId"
                render={({ field }) => (
                  <VehicleSelector value={field.value} onChange={handleVehicleChange} />
                )}
              />
            </FormField>

            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing="12px">
              <FormField label="Entrega" required error={errors.pickupAt?.message}>
                <Input type="datetime-local" {...register("pickupAt")} />
              </FormField>
              <FormField label="Devolución" required error={errors.returnAt?.message}>
                <Input type="datetime-local" {...register("returnAt")} />
              </FormField>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing="12px">
              <FormField label="Lugar de entrega" required error={errors.pickupLocation?.message}>
                <Controller
                  control={control}
                  name="pickupLocation"
                  render={({ field }) => (
                    <LocationSelect value={field.value} onChange={field.onChange} />
                  )}
                />
              </FormField>
              <FormField label="Lugar de devolución" required error={errors.returnLocation?.message}>
                <Controller
                  control={control}
                  name="returnLocation"
                  render={({ field }) => (
                    <LocationSelect value={field.value} onChange={field.onChange} />
                  )}
                />
              </FormField>
            </SimpleGrid>

            <Divider />

            <SimpleGrid columns={{ base: 2, sm: 4 }} spacing="12px">
              <FormField label="Tarifa diaria" error={errors.dailyRate?.message}>
                <MoneyInput register={register("dailyRate")} />
              </FormField>
              <FormField label="Seguro" error={errors.insuranceAmount?.message}>
                <MoneyInput register={register("insuranceAmount")} />
              </FormField>
              <FormField label="Depósito" error={errors.depositAmount?.message}>
                <MoneyInput register={register("depositAmount")} />
              </FormField>
              <FormField label="Descuento" error={errors.discountAmount?.message}>
                <MoneyInput register={register("discountAmount")} />
              </FormField>
            </SimpleGrid>

            <Box>
              <Flex align="center" justify="space-between" mb="8px">
                <Text fontSize="12px" fontWeight="600">
                  Cargos adicionales
                </Text>
                <Button
                  size="xs"
                  variant="outline"
                  leftIcon={<Plus size={13} />}
                  onClick={() => append({ id: generateId("chg"), label: "", amount: 0 })}
                >
                  Agregar
                </Button>
              </Flex>
              {fields.length === 0 ? (
                <Text fontSize="12px" color="fg.subtle">
                  Sin cargos adicionales.
                </Text>
              ) : (
                <Flex direction="column" gap="8px">
                  {fields.map((f, i) => (
                    <Flex key={f.id} gap="8px" align="flex-start">
                      <Input
                        placeholder="Concepto"
                        {...register(`additionalCharges.${i}.label` as const)}
                      />
                      <Box w="130px" flexShrink={0}>
                        <MoneyInput register={register(`additionalCharges.${i}.amount` as const)} />
                      </Box>
                      <IconButton
                        aria-label="Quitar cargo"
                        icon={<Trash2 size={14} />}
                        size="sm"
                        variant="ghost"
                        onClick={() => remove(i)}
                      />
                    </Flex>
                  ))}
                </Flex>
              )}
            </Box>

            <FormField label="Notas" error={errors.notes?.message}>
              <Textarea {...register("notes")} rows={3} placeholder="Instrucciones, vuelo, observaciones..." />
            </FormField>

            {/* Live calculation summary */}
            <Box bg="canvas.subtle" border="1px solid" borderColor="canvas.border" borderRadius="8px" p="12px">
              <Text fontSize="12px" fontWeight="700" mb="8px">
                Cálculo
              </Text>
              <Row label={`${billableDays} × ${formatCurrency(Number(values.dailyRate) || 0, tenant.currency)}`}>
                {formatCurrency(pricing.rentalTotal, tenant.currency)}
              </Row>
              {Number(values.insuranceAmount) > 0 && (
                <Row label="Seguro">{formatCurrency(Number(values.insuranceAmount), tenant.currency)}</Row>
              )}
              {pricing.additionalTotal > 0 && (
                <Row label="Cargos adicionales">{formatCurrency(pricing.additionalTotal, tenant.currency)}</Row>
              )}
              {Number(values.discountAmount) > 0 && (
                <Row label="Descuento">− {formatCurrency(Number(values.discountAmount), tenant.currency)}</Row>
              )}
              {pricing.taxAmount > 0 && (
                <>
                  <Row label="Subtotal">{formatCurrency(pricing.subtotal, tenant.currency)}</Row>
                  <Row label="ITBIS (18%)">{formatCurrency(pricing.taxAmount, tenant.currency)}</Row>
                </>
              )}
              <Divider my="6px" />
              <Flex justify="space-between" fontWeight="800" fontSize="14px" color="brand.600">
                <Text>Total</Text>
                <Text>{formatCurrency(pricing.total, tenant.currency)}</Text>
              </Flex>
              <Row label="Depósito">{formatCurrency(Number(values.depositAmount) || 0, tenant.currency)}</Row>
            </Box>
          </Flex>
        </DrawerBody>

        <DrawerFooter borderTop="1px solid" borderColor="canvas.border" gap="8px">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          {isEdit ? (
            <Button
              colorScheme="red"
              bg="brand.500"
              _hover={{ bg: "brand.600" }}
              onClick={() => save(false)}
            >
              Guardar cambios
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => save(false)}>
                Guardar borrador
              </Button>
              <Button
                colorScheme="red"
                bg="brand.500"
                _hover={{ bg: "brand.600" }}
                onClick={() => save(true)}
              >
                Crear y enviar
              </Button>
            </>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function MoneyInput({ register }: { register: ReturnType<ReturnType<typeof useForm>["register"]> }) {
  return (
    <InputGroup size="sm">
      <InputLeftAddon px="8px" fontSize="12px" color="fg.muted">
        US$
      </InputLeftAddon>
      <Input type="number" step="0.01" min="0" {...register} />
    </InputGroup>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Flex justify="space-between" fontSize="12px" py="2px">
      <Text color="fg.muted">{label}</Text>
      <Text color="fg.default">{children}</Text>
    </Flex>
  );
}

function emptyValues(
  customerId = "",
  vehicleId = "",
): ContractEditorValues {
  return {
    customerId,
    vehicleId,
    pickupAt: "",
    returnAt: "",
    pickupLocation: "Aeropuerto Internacional Las Américas (SDQ)",
    returnLocation: "Aeropuerto Internacional Las Américas (SDQ)",
    dailyRate: 0,
    insuranceAmount: 0,
    depositAmount: 0,
    discountAmount: 0,
    additionalCharges: [],
    notes: "",
  };
}
