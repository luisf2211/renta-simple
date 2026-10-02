import type { StoredImage } from "./customer";
import type { Transmission } from "./vehicle";
import type { ContractTermsSection } from "./tenant";

export type ContractStatus =
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "CHANGES_REQUESTED"
  | "SIGNED"
  | "DELIVERED"
  | "RETURNED"
  | "CLOSED"
  | "CANCELLED"
  | "EXPIRED";

export type ContractEventType =
  | "CONTRACT_CREATED"
  | "CONTRACT_EDITED"
  | "CONTRACT_SENT"
  | "CONTRACT_VIEWED"
  | "CHANGES_REQUESTED"
  | "CUSTOMER_INFO_UPDATED"
  | "DOCUMENT_UPLOADED"
  | "CONTRACT_SIGNED"
  | "CONTRACT_DELIVERED"
  | "CONTRACT_RETURNED"
  | "CONTRACT_CLOSED"
  | "CONTRACT_CANCELLED";

export interface ContractEvent {
  id: string;
  type: ContractEventType;
  at: string; // ISO datetime
  actor: string; // "Christian", "Juan Pérez", "Sistema"
  description: string;
}

export interface ContractDocument {
  id: string;
  name: string;
  type: "Contrato" | "Licencia" | "Pasaporte" | "Identificación" | "Otro";
  addedAt: string;
  image?: StoredImage;
}

export interface AdditionalCharge {
  id: string;
  label: string;
  amount: number;
}

/** Immutable snapshots captured at signing time (prototype immutability). */
export interface BusinessSnapshot {
  businessName: string;
  legalName: string;
  logo: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  website?: string;
}

export interface CustomerSnapshot {
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  city: string;
  country: string;
  licenseNumber: string;
  licenseCountry: string;
  licenseExpiration: string;
  licenseFrontImage?: StoredImage;
  licenseBackImage?: StoredImage;
  passportNumber?: string;
  passportImage?: StoredImage;
}

export interface VehicleSnapshot {
  brand: string;
  model: string;
  year: number;
  plate: string;
  vin: string;
  color: string;
  transmission: Transmission;
  passengers: number;
  image?: string;
  /** Extra photos captured at signing (gallery URLs). */
  photos?: string[];
  /** Amenity names captured at signing. */
  amenities?: string[];
}

export interface SignatureMetadata {
  signedAt: string;
  documentVersion: number;
  verificationId: string;
  documentHash: string;
  userAgent?: string;
}

/**
 * Full immutable copy of everything shown on the signed document. Rendered
 * instead of the live mutable records so later edits never change a signed doc.
 */
export interface SignedSnapshot {
  business: BusinessSnapshot;
  customer: CustomerSnapshot;
  vehicle: VehicleSnapshot;
  pricing: PricingSnapshot;
  period: PeriodSnapshot;
  terms: ContractTermsSection[];
  customerSignature: string; // data URL
  representativeSignature?: string; // data URL (seeded demo)
  representativeName: string;
  signature: SignatureMetadata;
  notes?: string;
}

export interface PricingSnapshot {
  billableDays: number;
  dailyRate: number;
  insuranceAmount: number;
  depositAmount: number;
  discountAmount: number;
  additionalCharges: AdditionalCharge[];
  subtotal: number;
  taxAmount: number;
  total: number;
  taxRate?: number;
  currency: string;
}

export interface PeriodSnapshot {
  pickupAt: string;
  returnAt: string;
  pickupLocation: string;
  returnLocation: string;
  billableDays: number;
}

export interface Contract {
  id: string;
  contractNumber: string; // e.g. "AR-1058"
  token: string; // customer link token, e.g. "demo-ar-1058"
  customerId: string;
  vehicleId: string;
  status: ContractStatus;

  pickupAt: string; // ISO datetime
  returnAt: string;
  pickupLocation: string;
  returnLocation: string;

  billableDays: number;
  dailyRate: number;
  insuranceAmount: number;
  depositAmount: number;
  discountAmount: number;
  additionalCharges: AdditionalCharge[];

  subtotal: number;
  taxAmount: number; // ITBIS (tenant default_tax_rate, e.g. 18%)
  total: number;

  notes?: string;

  createdAt: string;
  sentAt?: string;
  viewedAt?: string;
  signedAt?: string;

  signature?: string; // raw data URL (live)
  signatureMetadata?: SignatureMetadata;
  signedSnapshot?: SignedSnapshot;

  events: ContractEvent[];
  documents: ContractDocument[];
}
