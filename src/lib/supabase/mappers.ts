import type {
  Amenity,
  Location,
  LocationType,
  Contract,
  ContractEvent,
  ContractEventType,
  ContractStatus,
  Customer,
  SignatureMetadata,
  SignedSnapshot,
  Tenant,
  Transmission,
  Vehicle,
  VehiclePhoto,
  VehicleStatus,
  StoredImage,
} from "@/types";
import type {
  AmenityRow,
  LocationRow,
  ContractChargeRow,
  ContractEventRow,
  ContractRow,
  ContractSignatureRow,
  CustomerDocumentRow,
  CustomerRow,
  TenantRow,
  TenantSettingsRow,
  VehiclePhotoRow,
  VehicleRow,
} from "./db-types";

/* ------------------------------------------------------------------ */
/* Tenant                                                              */
/* ------------------------------------------------------------------ */

const DEMO_TERMS_FALLBACK: Tenant["contractTerms"] = [
  { title: "Objeto del contrato", body: "El presente contrato establece los términos y condiciones para el alquiler del vehículo descrito, entre la empresa y el arrendatario." },
  { title: "Uso del vehículo", body: "El vehículo será utilizado únicamente para fines personales y dentro del territorio permitido por la empresa." },
  { title: "Responsabilidad del arrendatario", body: "El cliente es responsable del vehículo desde la entrega hasta su devolución, salvo lo cubierto por el seguro." },
  { title: "Seguro", body: "El contrato incluye la cobertura de seguro indicada. El cliente debe cumplir con los deducibles y condiciones establecidas." },
  { title: "Depósito", body: "Se requiere un depósito al momento de la entrega, devuelto una vez finalizado el alquiler sin cargos pendientes." },
  { title: "Combustible", body: "El vehículo se entrega y debe devolverse con el mismo nivel de combustible, salvo acuerdo diferente." },
  { title: "Devolución del vehículo", body: "El vehículo debe devolverse en la fecha, hora y lugar indicados. Cargos adicionales pueden aplicar por retraso." },
  { title: "Aceptación", body: "Al firmar este documento, el cliente declara haber leído, entendido y aceptado todas las condiciones." },
];

export function mapTenant(
  row: TenantRow,
  settings: TenantSettingsRow | null,
  logoLabel: string,
  logoUrl?: string,
): Tenant {
  const terms = settings?.contract_terms
    ? [{ title: "Términos y condiciones", body: settings.contract_terms }]
    : DEMO_TERMS_FALLBACK;

  return {
    id: row.id,
    businessName: row.business_name,
    legalName: row.legal_name ?? row.business_name,
    logo: logoLabel,
    primaryColor: settings?.primary_color ?? "#e5312f",
    secondaryColor: settings?.secondary_color ?? "#1f2328",
    logoUrl,
    email: row.email ?? "",
    phone: row.primary_phone ?? "",
    secondaryPhone: row.secondary_phone ?? undefined,
    address: row.address ?? "",
    country: row.country ?? "",
    taxId: row.tax_id ?? undefined,
    currency: row.currency ?? settings?.default_currency ?? "USD",
    timezone: row.timezone ?? "America/Santo_Domingo",
    contractPrefix: settings?.contract_prefix ?? "AR",
    taxRate: settings?.default_tax_rate ?? 0,
    website: undefined,
    contractTerms: terms,
  };
}

/** Default ITBIS rate used across the app, sourced from tenant settings. */
export function taxRateFromSettings(settings: TenantSettingsRow | null): number {
  return settings?.default_tax_rate ?? 0;
}

/** Map editable tenant fields back to the tenants row. */
export function tenantToRow(t: Partial<Tenant>): Partial<TenantRow> {
  const row: Partial<TenantRow> = {};
  if (t.businessName !== undefined) row.business_name = t.businessName;
  if (t.legalName !== undefined) row.legal_name = t.legalName;
  if (t.email !== undefined) row.email = t.email || null;
  if (t.phone !== undefined) row.primary_phone = t.phone || null;
  if (t.secondaryPhone !== undefined) row.secondary_phone = t.secondaryPhone || null;
  if (t.address !== undefined) row.address = t.address || null;
  if (t.country !== undefined) row.country = t.country || null;
  if (t.taxId !== undefined) row.tax_id = t.taxId || null;
  if (t.currency !== undefined) row.currency = t.currency;
  return row;
}

/* ------------------------------------------------------------------ */
/* Customer                                                            */
/* ------------------------------------------------------------------ */

export function mapCustomer(
  row: CustomerRow,
  images?: {
    licenseFront?: StoredImage;
    licenseBack?: StoredImage;
    passport?: StoredImage;
  },
): Customer {
  const isComplete =
    !!row.date_of_birth && !!row.driver_license_number && !!row.phone;
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone ?? "",
    email: row.email ?? "",
    dateOfBirth: row.date_of_birth ?? "",
    nationality: row.country ?? "",
    address: [row.address_line1, row.address_line2].filter(Boolean).join(", "),
    city: row.city ?? "",
    country: row.country ?? "",
    postalCode: "",
    licenseNumber: row.driver_license_number ?? "",
    licenseCountry: row.driver_license_country ?? "",
    licenseExpiration: row.driver_license_expiration ?? "",
    licenseFrontImage: images?.licenseFront,
    licenseBackImage: images?.licenseBack,
    passportNumber: row.passport_number ?? undefined,
    passportCountry: row.passport_country ?? undefined,
    passportImage: images?.passport,
    notes: row.notes ?? undefined,
    isProfileComplete: isComplete,
    createdAt: row.created_at,
  };
}

/** Split a full name into first/last for the DB (best-effort). */
export function splitName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0] ?? "", last: "" };
  return { first: parts[0] ?? "", last: parts.slice(1).join(" ") };
}

export function customerToRow(c: Partial<Customer>): Partial<CustomerRow> {
  const row: Partial<CustomerRow> = {};
  if (c.fullName !== undefined) {
    const { first, last } = splitName(c.fullName);
    row.full_name = c.fullName;
    row.first_name = first;
    row.last_name = last;
  }
  if (c.phone !== undefined) row.phone = c.phone;
  if (c.email !== undefined) row.email = c.email || null;
  if (c.dateOfBirth !== undefined) row.date_of_birth = c.dateOfBirth || null;
  if (c.nationality !== undefined) row.country = c.nationality || null;
  if (c.address !== undefined) row.address_line1 = c.address || null;
  if (c.city !== undefined) row.city = c.city || null;
  if (c.country !== undefined) row.country = c.country || null;
  if (c.licenseNumber !== undefined) row.driver_license_number = c.licenseNumber || null;
  if (c.licenseCountry !== undefined) row.driver_license_country = c.licenseCountry || null;
  if (c.licenseExpiration !== undefined) row.driver_license_expiration = c.licenseExpiration || null;
  if (c.passportNumber !== undefined) row.passport_number = c.passportNumber || null;
  if (c.passportCountry !== undefined) row.passport_country = c.passportCountry || null;
  if (c.notes !== undefined) row.notes = c.notes || null;
  return row;
}

/* ------------------------------------------------------------------ */
/* Vehicle                                                             */
/* ------------------------------------------------------------------ */

export function mapVehicle(
  row: VehicleRow,
  extras?: { photos?: VehiclePhoto[]; amenities?: Amenity[] },
): Vehicle {
  const photos = extras?.photos ?? [];
  const amenities = extras?.amenities ?? [];
  const primary = photos.find((p) => p.isPrimary) ?? photos[0];
  return {
    id: row.id,
    brand: row.brand,
    model: row.model,
    year: row.year,
    plate: row.plate,
    vin: row.vin ?? "",
    color: row.color ?? "",
    transmission: "AUTOMATIC", // schema has no transmission; default
    passengers: 5, // schema has no passengers; sensible default
    fleetNumber: row.fleet_number ?? "",
    status: mapVehicleStatus(row.status),
    image: primary?.url,
    dailyRate: 0, // rate lives on the contract in this schema
    photos,
    amenityIds: amenities.map((a) => a.id),
    amenities,
  };
}

export function mapAmenity(row: AmenityRow): Amenity {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    category: (["COMFORT", "SAFETY", "CONNECTIVITY", "CAPACITY", "OTHER"].includes(
      row.category,
    )
      ? row.category
      : "OTHER") as Amenity["category"],
    description: row.description ?? undefined,
    isActive: row.is_active,
    sortOrder: row.sort_order,
  };
}

export function mapLocation(row: LocationRow): Location {
  const type = (["AIRPORT", "OFFICE", "HOTEL", "OTHER"].includes(row.type)
    ? row.type
    : "OTHER") as LocationType;
  return {
    id: row.id,
    name: row.name,
    address: row.address ?? undefined,
    type,
    isActive: row.is_active,
    sortOrder: row.sort_order,
  };
}

export function mapVehiclePhoto(row: VehiclePhotoRow, url: string): VehiclePhoto {
  return {
    id: row.id,
    url,
    storagePath: row.storage_path,
    fileName: row.original_filename ?? undefined,
    isPrimary: row.is_primary,
    sortOrder: row.sort_order,
  };
}

function mapVehicleStatus(s: string): VehicleStatus {
  // The DB adds INACTIVE which the UI treats as MAINTENANCE (not rentable).
  if (s === "AVAILABLE" || s === "RENTED" || s === "MAINTENANCE") return s;
  return "MAINTENANCE";
}

export function vehicleToRow(v: Partial<Vehicle>): Partial<VehicleRow> {
  const row: Partial<VehicleRow> = {};
  if (v.brand !== undefined) row.brand = v.brand;
  if (v.model !== undefined) row.model = v.model;
  if (v.year !== undefined) row.year = v.year;
  if (v.plate !== undefined) row.plate = v.plate;
  if (v.color !== undefined) row.color = v.color;
  if (v.vin !== undefined) row.vin = v.vin;
  if (v.fleetNumber !== undefined) row.fleet_number = v.fleetNumber;
  if (v.status !== undefined) row.status = v.status;
  return row;
}

/* ------------------------------------------------------------------ */
/* Contract                                                            */
/* ------------------------------------------------------------------ */

const CONTRACT_STATUSES: ContractStatus[] = [
  "DRAFT", "SENT", "VIEWED", "CHANGES_REQUESTED", "SIGNED",
  "DELIVERED", "RETURNED", "CLOSED", "CANCELLED", "EXPIRED",
];

function mapContractStatus(s: string): ContractStatus {
  return (CONTRACT_STATUSES as string[]).includes(s)
    ? (s as ContractStatus)
    : "DRAFT";
}

export function formatContractNumber(prefix: string, n: number): string {
  return `${prefix}-${n}`;
}

const EVENT_TYPES: ContractEventType[] = [
  "CONTRACT_CREATED", "CONTRACT_EDITED", "CONTRACT_SENT", "CONTRACT_VIEWED",
  "CHANGES_REQUESTED", "CUSTOMER_INFO_UPDATED", "DOCUMENT_UPLOADED",
  "CONTRACT_SIGNED", "CONTRACT_DELIVERED", "CONTRACT_RETURNED",
  "CONTRACT_CLOSED", "CONTRACT_CANCELLED",
];

export function mapEvent(row: ContractEventRow): ContractEvent {
  const type = (EVENT_TYPES as string[]).includes(row.event_type)
    ? (row.event_type as ContractEventType)
    : "CONTRACT_EDITED";
  const meta = row.metadata ?? {};
  return {
    id: row.id,
    type,
    at: row.created_at,
    actor: (meta.actor as string) || (row.actor_type === "CUSTOMER" ? "Cliente" : "Christian"),
    description: (meta.description as string) || "",
  };
}

export interface ContractMapExtras {
  prefix: string;
  charges: ContractChargeRow[];
  events: ContractEventRow[];
  signature?: ContractSignatureRow;
  signatureImageUrl?: string;
  representativeSignatureUrl?: string;
  customerLicenseFront?: StoredImage;
  customerLicenseBack?: StoredImage;
  vehicleImage?: string;
  vehiclePhotoUrls?: string[];
  vehicleAmenityNames?: string[];
  taxRate: number;
  contractTerms: Tenant["contractTerms"];
}

export function mapContract(row: ContractRow, x: ContractMapExtras): Contract {
  const additionalCharges = x.charges
    .filter((c) => !["RENTAL", "INSURANCE", "DISCOUNT"].includes(c.type))
    .map((c) => ({
      id: c.id,
      label: c.description ?? c.type,
      amount: Number(c.total_amount),
    }));

  const signedSnapshot = buildSignedSnapshotFromRow(row, x);

  return {
    id: row.id,
    contractNumber: formatContractNumber(x.prefix, row.contract_number),
    token: row.public_token ?? row.id,
    customerId: row.customer_id,
    vehicleId: row.vehicle_id,
    status: mapContractStatus(row.status),
    pickupAt: row.pickup_at,
    returnAt: row.return_at,
    pickupLocation: pickFromSnapshot(row.pricing_snapshot, "pickup_location") ?? "—",
    returnLocation: pickFromSnapshot(row.pricing_snapshot, "return_location") ?? "—",
    billableDays: row.billable_days,
    dailyRate: Number(row.daily_rate),
    insuranceAmount: Number(row.insurance_amount),
    depositAmount: Number(row.deposit_amount),
    discountAmount: Number(row.discount_amount),
    additionalCharges,
    subtotal: Number(row.subtotal),
    taxAmount: Number(row.tax_amount),
    total: Number(row.total_amount),
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    sentAt: row.sent_at ?? undefined,
    viewedAt: row.viewed_at ?? undefined,
    signedAt: row.signed_at ?? undefined,
    signature: x.signatureImageUrl,
    signatureMetadata: x.signature
      ? {
          signedAt: x.signature.signed_at ?? row.signed_at ?? row.updated_at,
          documentVersion: x.signature.document_version ?? 1,
          verificationId: x.signature.id,
          documentHash: x.signature.document_hash
            ? `SHA-256: ${x.signature.document_hash}`
            : "SHA-256: (demo)",
        }
      : undefined,
    signedSnapshot: signedSnapshot ?? undefined,
    events: x.events.map(mapEvent),
    documents: [],
  };
}

function pickFromSnapshot(
  snap: Record<string, unknown> | null,
  key: string,
): string | undefined {
  const v = snap?.[key];
  return typeof v === "string" ? v : undefined;
}

function buildSignedSnapshotFromRow(
  row: ContractRow,
  x: ContractMapExtras,
): SignedSnapshot | null {
  if (row.status === "DRAFT" || !row.signed_at) return null;

  const cs = (row.customer_snapshot ?? {}) as Record<string, unknown>;
  const vs = (row.vehicle_snapshot ?? {}) as Record<string, unknown>;
  const bs = (row.business_snapshot ?? {}) as Record<string, unknown>;

  const str = (o: Record<string, unknown>, k: string): string =>
    typeof o[k] === "string" ? (o[k] as string) : "";
  const num = (o: Record<string, unknown>, k: string, d = 0): number =>
    typeof o[k] === "number" ? (o[k] as number) : d;

  const metadata: SignatureMetadata = {
    signedAt: row.signed_at,
    documentVersion: x.signature?.document_version ?? 1,
    verificationId: x.signature?.id ?? row.id,
    documentHash: x.signature?.document_hash
      ? `SHA-256: ${x.signature.document_hash}`
      : "SHA-256: (demo)",
  };

  return {
    business: {
      businessName: str(bs, "business_name") || "Aybar Rent Car",
      legalName: str(bs, "legal_name") || "Aybar Rent Car SRL",
      logo: "AYBAR",
      email: str(bs, "email"),
      phone: str(bs, "primary_phone"),
      address: str(bs, "address"),
      country: "República Dominicana",
    },
    customer: {
      fullName: str(cs, "full_name"),
      phone: str(cs, "phone"),
      email: str(cs, "email"),
      dateOfBirth: str(cs, "date_of_birth"),
      nationality: str(cs, "country"),
      address: str(cs, "address_line1"),
      city: str(cs, "city"),
      country: str(cs, "country"),
      licenseNumber: str(cs, "driver_license_number"),
      licenseCountry: str(cs, "driver_license_country"),
      licenseExpiration: str(cs, "driver_license_expiration"),
      licenseFrontImage: x.customerLicenseFront,
      licenseBackImage: x.customerLicenseBack,
      passportNumber: str(cs, "passport_number") || undefined,
    },
    vehicle: {
      brand: str(vs, "brand"),
      model: str(vs, "model"),
      year: num(vs, "year", 0),
      plate: str(vs, "plate"),
      vin: str(vs, "vin"),
      color: str(vs, "color"),
      transmission: "AUTOMATIC" as Transmission,
      passengers: 5,
      image: x.vehicleImage,
      photos: x.vehiclePhotoUrls && x.vehiclePhotoUrls.length ? x.vehiclePhotoUrls : undefined,
      amenities:
        x.vehicleAmenityNames && x.vehicleAmenityNames.length
          ? x.vehicleAmenityNames
          : undefined,
    },
    pricing: {
      billableDays: row.billable_days,
      dailyRate: Number(row.daily_rate),
      insuranceAmount: Number(row.insurance_amount),
      depositAmount: Number(row.deposit_amount),
      discountAmount: Number(row.discount_amount),
      additionalCharges: x.charges
        .filter((c) => !["RENTAL", "INSURANCE", "DISCOUNT"].includes(c.type))
        .map((c) => ({ id: c.id, label: c.description ?? c.type, amount: Number(c.total_amount) })),
      subtotal: Number(row.subtotal),
      taxAmount: Number(row.tax_amount),
      total: Number(row.total_amount),
      taxRate: x.taxRate,
      currency: row.currency,
    },
    period: {
      pickupAt: row.pickup_at,
      returnAt: row.return_at,
      pickupLocation: pickFromSnapshot(row.pricing_snapshot, "pickup_location") ?? "—",
      returnLocation: pickFromSnapshot(row.pricing_snapshot, "return_location") ?? "—",
      billableDays: row.billable_days,
    },
    terms: x.contractTerms,
    customerSignature: x.signatureImageUrl ?? "",
    representativeSignature: x.representativeSignatureUrl,
    representativeName: "Christian Aybar",
    signature: metadata,
    notes: row.notes ?? undefined,
  };
}

/** Map a customer_documents row's document_type to our image slots. */
export function documentTypeToSlot(
  t: string,
): "licenseFront" | "licenseBack" | "passport" | null {
  switch (t) {
    case "DRIVER_LICENSE_FRONT":
      return "licenseFront";
    case "DRIVER_LICENSE_BACK":
      return "licenseBack";
    case "PASSPORT":
      return "passport";
    default:
      return null;
  }
}

export type { CustomerDocumentRow };
