import type {
  Contract,
  Customer,
  SignatureMetadata,
  SignedSnapshot,
  Tenant,
  Vehicle,
} from "@/types";
import {
  generateDocumentHash,
  generateVerificationId,
} from "./verification";
import { SEED_SIGNATURE_REPRESENTATIVE } from "@/data/mock/seed-assets";

/**
 * Build the immutable signed snapshot captured at signing time. Everything the
 * signed document renders is copied here so later edits to the live customer /
 * vehicle / pricing records never mutate an already-signed document (req. 44).
 */
export function buildSignedSnapshot(params: {
  contract: Contract;
  customer: Customer;
  vehicle: Vehicle;
  tenant: Tenant;
  customerSignature: string;
}): { snapshot: SignedSnapshot; metadata: SignatureMetadata } {
  const { contract, customer, vehicle, tenant, customerSignature } = params;

  const metadata: SignatureMetadata = {
    signedAt: new Date().toISOString(),
    documentVersion: 1,
    verificationId: generateVerificationId(),
    documentHash: generateDocumentHash(),
    userAgent:
      typeof navigator !== "undefined" ? navigator.userAgent : undefined,
  };

  const snapshot: SignedSnapshot = {
    business: {
      businessName: tenant.businessName,
      legalName: tenant.legalName,
      logo: tenant.logo,
      email: tenant.email,
      phone: tenant.phone,
      address: tenant.address,
      country: tenant.country,
      website: tenant.website,
    },
    customer: {
      fullName: customer.fullName,
      phone: customer.phone,
      email: customer.email,
      dateOfBirth: customer.dateOfBirth,
      nationality: customer.nationality,
      address: customer.address,
      city: customer.city,
      country: customer.country,
      licenseNumber: customer.licenseNumber,
      licenseCountry: customer.licenseCountry,
      licenseExpiration: customer.licenseExpiration,
      licenseFrontImage: customer.licenseFrontImage,
      licenseBackImage: customer.licenseBackImage,
      passportNumber: customer.passportNumber,
      passportImage: customer.passportImage,
    },
    vehicle: {
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      plate: vehicle.plate,
      vin: vehicle.vin,
      color: vehicle.color,
      transmission: vehicle.transmission,
      passengers: vehicle.passengers,
      image: vehicle.image,
    },
    pricing: {
      billableDays: contract.billableDays,
      dailyRate: contract.dailyRate,
      insuranceAmount: contract.insuranceAmount,
      depositAmount: contract.depositAmount,
      discountAmount: contract.discountAmount,
      additionalCharges: contract.additionalCharges,
      subtotal: contract.subtotal,
      taxAmount: contract.taxAmount,
      total: contract.total,
      currency: tenant.currency,
    },
    period: {
      pickupAt: contract.pickupAt,
      returnAt: contract.returnAt,
      pickupLocation: contract.pickupLocation,
      returnLocation: contract.returnLocation,
      billableDays: contract.billableDays,
    },
    terms: tenant.contractTerms,
    customerSignature,
    representativeSignature: SEED_SIGNATURE_REPRESENTATIVE,
    representativeName: "Christian Aybar",
    signature: metadata,
    notes: contract.notes,
  };

  return { snapshot, metadata };
}
