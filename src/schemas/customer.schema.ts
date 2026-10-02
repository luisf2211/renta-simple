import { z } from "zod";

/** Full customer information collected in the customer flow (Step 2). */
export const customerInfoSchema = z.object({
  fullName: z.string().min(3, "Ingresa el nombre completo"),
  dateOfBirth: z.string().min(1, "Requerido"),
  nationality: z.string().min(2, "Requerido"),
  phone: z.string().min(7, "Teléfono inválido"),
  email: z.string().email("Email inválido"),
  address: z.string().optional().default(""),
  city: z.string().optional().default(""),
  postalCode: z.string().optional().default(""),
  country: z.string().optional().default(""),
});

export type CustomerInfoValues = z.infer<typeof customerInfoSchema>;

/** License data captured below the document photos (Step 3). */
export const licenseDataSchema = z.object({
  licenseNumber: z.string().min(3, "Requerido"),
  licenseCountry: z.string().min(2, "Requerido"),
  licenseExpiration: z.string().min(1, "Requerido"),
});

export type LicenseDataValues = z.infer<typeof licenseDataSchema>;

/** Quick-create customer in the admin new-contract flow. */
export const quickCustomerSchema = z.object({
  fullName: z.string().min(3, "Ingresa el nombre"),
  phone: z.string().min(7, "Teléfono inválido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
});

export type QuickCustomerValues = z.infer<typeof quickCustomerSchema>;

/** Admin-side full customer editor. */
export const customerEditSchema = z.object({
  fullName: z.string().min(3, "Requerido"),
  phone: z.string().min(7, "Requerido"),
  email: z.string().email("Email inválido"),
  dateOfBirth: z.string().optional().default(""),
  nationality: z.string().optional().default(""),
  address: z.string().optional().default(""),
  city: z.string().optional().default(""),
  country: z.string().optional().default(""),
  postalCode: z.string().optional().default(""),
  licenseNumber: z.string().optional().default(""),
  licenseCountry: z.string().optional().default(""),
  licenseExpiration: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

export type CustomerEditValues = z.infer<typeof customerEditSchema>;
