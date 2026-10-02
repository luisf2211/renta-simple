import { z } from "zod";

const additionalChargeSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Describe el cargo"),
  amount: z.coerce.number().min(0, "Monto inválido"),
});

export const contractEditorSchema = z.object({
  customerId: z.string().min(1, "Selecciona un cliente"),
  vehicleId: z.string().min(1, "Selecciona un vehículo"),
  pickupAt: z.string().min(1, "Requerido"),
  returnAt: z.string().min(1, "Requerido"),
  pickupLocation: z.string().min(1, "Requerido"),
  returnLocation: z.string().min(1, "Requerido"),
  dailyRate: z.coerce.number().min(0, "Tarifa inválida"),
  insuranceAmount: z.coerce.number().min(0, "Monto inválido"),
  depositAmount: z.coerce.number().min(0, "Monto inválido"),
  discountAmount: z.coerce.number().min(0, "Monto inválido"),
  additionalCharges: z.array(additionalChargeSchema).default([]),
  notes: z.string().optional().default(""),
});

export type ContractEditorValues = z.infer<typeof contractEditorSchema>;
