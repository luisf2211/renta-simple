import type { AdditionalCharge } from "@/types";

export interface PricingInput {
  billableDays: number;
  dailyRate: number;
  insuranceAmount: number;
  discountAmount: number;
  additionalCharges: AdditionalCharge[];
  /** ITBIS rate as a fraction (e.g. 0.18). Defaults to 0 (tax-exclusive). */
  taxRate?: number;
}

export interface PricingResult {
  rentalTotal: number; // days * rate
  additionalTotal: number;
  subtotal: number; // rental + insurance + additional - discount
  taxAmount: number; // subtotal * taxRate
  total: number; // subtotal + tax
}

/** Single source of truth for contract money math (live editor + snapshots). */
export function calculatePricing(input: PricingInput): PricingResult {
  const days = Math.max(0, Math.floor(input.billableDays || 0));
  const rate = Math.max(0, input.dailyRate || 0);
  const insurance = Math.max(0, input.insuranceAmount || 0);
  const discount = Math.max(0, input.discountAmount || 0);
  const taxRate = Math.max(0, input.taxRate || 0);

  const rentalTotal = days * rate;
  const additionalTotal = (input.additionalCharges || []).reduce(
    (sum, c) => sum + (Number.isFinite(c.amount) ? c.amount : 0),
    0,
  );
  const subtotal = Math.max(0, rentalTotal + insurance + additionalTotal - discount);
  const taxAmount = round2(subtotal * taxRate);
  const total = round2(subtotal + taxAmount);

  return { rentalTotal, additionalTotal, subtotal, taxAmount, total };
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Billable days between two datetimes, rounded up, minimum 1 when valid. */
export function calculateBillableDays(
  pickupAt: string,
  returnAt: string,
): number {
  const start = new Date(pickupAt).getTime();
  const end = new Date(returnAt).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0;
  }
  const ms = end - start;
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return Math.max(1, days);
}
