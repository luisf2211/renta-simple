import { z } from "zod";

export const signatureStepSchema = z.object({
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar los términos y condiciones" }),
  }),
  signature: z.string().min(1, "La firma es obligatoria"),
});

export type SignatureStepValues = z.infer<typeof signatureStepSchema>;
