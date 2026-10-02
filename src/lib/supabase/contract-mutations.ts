import "server-only";
import { getSupabaseAdmin, AYBAR_TENANT_ID, BUCKETS, DEFAULT_STAFF_PROFILE_ID } from "./server";
import { fetchContract, fetchContractByToken } from "./service";
import { splitName } from "./mappers";
import type { Contract, ContractEventType } from "@/types";
import type { ContractRow } from "./db-types";

/** Map our domain event types to the DB's actor_type convention. */
function actorTypeFor(type: ContractEventType): string {
  return [
    "CONTRACT_VIEWED",
    "CUSTOMER_INFO_UPDATED",
    "DOCUMENT_UPLOADED",
    "CONTRACT_SIGNED",
    "CHANGES_REQUESTED",
  ].includes(type)
    ? "CUSTOMER"
    : "STAFF";
}

export async function appendEvent(
  contractId: string,
  type: ContractEventType,
  actor: string,
  description: string,
): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.from("contract_events").insert({
    tenant_id: AYBAR_TENANT_ID,
    contract_id: contractId,
    event_type: type,
    actor_type: actorTypeFor(type),
    metadata: { actor, description },
  });
}

/** Replace the contract's additional charges (keeps RENTAL/INSURANCE intact). */
async function syncCharges(contract: Contract): Promise<void> {
  const supabase = getSupabaseAdmin();
  // Rebuild RENTAL + INSURANCE + additional from the current contract values.
  await supabase.from("contract_charges").delete().eq("contract_id", contract.id);
  const rows = [
    {
      tenant_id: AYBAR_TENANT_ID,
      contract_id: contract.id,
      type: "RENTAL",
      description: `Alquiler x${contract.billableDays}`,
      quantity: contract.billableDays,
      unit_amount: contract.dailyRate,
      total_amount: contract.billableDays * contract.dailyRate,
    },
    ...(contract.insuranceAmount > 0
      ? [{
          tenant_id: AYBAR_TENANT_ID,
          contract_id: contract.id,
          type: "INSURANCE",
          description: "Seguro",
          quantity: 1,
          unit_amount: contract.insuranceAmount,
          total_amount: contract.insuranceAmount,
        }]
      : []),
    ...contract.additionalCharges.map((c) => ({
      tenant_id: AYBAR_TENANT_ID,
      contract_id: contract.id,
      type: "OTHER",
      description: c.label,
      quantity: 1,
      unit_amount: c.amount,
      total_amount: c.amount,
    })),
  ];
  if (rows.length) await supabase.from("contract_charges").insert(rows);
}

function contractCoreRow(c: Contract): Partial<ContractRow> {
  return {
    customer_id: c.customerId,
    vehicle_id: c.vehicleId,
    status: c.status,
    pickup_at: c.pickupAt,
    return_at: c.returnAt,
    billable_days: c.billableDays,
    daily_rate: c.dailyRate,
    insurance_amount: c.insuranceAmount,
    discount_amount: c.discountAmount,
    subtotal: c.subtotal,
    tax_amount: c.taxAmount,
    total_amount: c.total,
    deposit_amount: c.depositAmount,
    currency: "USD",
    notes: c.notes ?? null,
    sent_at: c.sentAt ?? null,
    viewed_at: c.viewedAt ?? null,
    signed_at: c.signedAt ?? null,
    pricing_snapshot: {
      pickup_location: c.pickupLocation,
      return_location: c.returnLocation,
    },
  };
}

/** Public link token for the customer-facing contract URL (/c/[token]). */
function generatePublicToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  // URL-safe base64 (no padding).
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Create a new contract. contract_number is allocated by the DB RPC. */
export async function createContract(c: Contract): Promise<Contract> {
  const supabase = getSupabaseAdmin();

  // Allocate the next contract number via the existing RPC.
  const { data: numData, error: numErr } = await supabase.rpc("next_contract_number", {
    p_tenant_id: AYBAR_TENANT_ID,
  });
  const contractNumber =
    typeof numData === "number" ? numData : Number(numData) || undefined;

  // Public token so the customer link + signing flow can resolve the contract.
  const publicToken = generatePublicToken();
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);

  const insertRow = {
    ...contractCoreRow(c),
    tenant_id: AYBAR_TENANT_ID,
    created_by: DEFAULT_STAFF_PROFILE_ID,
    public_token: publicToken,
    public_token_expires_at: expires.toISOString(),
    ...(contractNumber && !numErr ? { contract_number: contractNumber } : {}),
  };

  const { data, error } = await supabase
    .from("contracts")
    .insert(insertRow)
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const newId = (data as { id: string }).id;
  const created = { ...c, id: newId };
  await syncCharges(created);
  await appendEvent(newId, "CONTRACT_CREATED", "Christian", "Contrato creado.");

  const result = await fetchContract(newId);
  if (!result) throw new Error("No se pudo leer el contrato creado.");
  return result;
}

/** Patch a contract. Accepts a partial domain object; refetches the full row. */
export async function updateContract(
  id: string,
  patch: Partial<Contract>,
): Promise<Contract> {
  const supabase = getSupabaseAdmin();

  const row: Partial<ContractRow> = {};
  if (patch.customerId !== undefined) row.customer_id = patch.customerId;
  if (patch.vehicleId !== undefined) row.vehicle_id = patch.vehicleId;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.pickupAt !== undefined) row.pickup_at = patch.pickupAt;
  if (patch.returnAt !== undefined) row.return_at = patch.returnAt;
  if (patch.billableDays !== undefined) row.billable_days = patch.billableDays;
  if (patch.dailyRate !== undefined) row.daily_rate = patch.dailyRate;
  if (patch.insuranceAmount !== undefined) row.insurance_amount = patch.insuranceAmount;
  if (patch.discountAmount !== undefined) row.discount_amount = patch.discountAmount;
  if (patch.depositAmount !== undefined) row.deposit_amount = patch.depositAmount;
  if (patch.subtotal !== undefined) row.subtotal = patch.subtotal;
  if (patch.taxAmount !== undefined) row.tax_amount = patch.taxAmount;
  if (patch.total !== undefined) row.total_amount = patch.total;
  if (patch.notes !== undefined) row.notes = patch.notes ?? null;
  if (patch.sentAt !== undefined) row.sent_at = patch.sentAt ?? null;
  if (patch.viewedAt !== undefined) row.viewed_at = patch.viewedAt ?? null;
  if (patch.signedAt !== undefined) row.signed_at = patch.signedAt ?? null;
  if (patch.pickupLocation !== undefined || patch.returnLocation !== undefined) {
    const current = await fetchContract(id);
    row.pricing_snapshot = {
      pickup_location: patch.pickupLocation ?? current?.pickupLocation ?? "",
      return_location: patch.returnLocation ?? current?.returnLocation ?? "",
    };
  }

  if (Object.keys(row).length > 0) {
    const { error } = await supabase.from("contracts").update(row).eq("id", id);
    if (error) throw new Error(error.message);
  }

  // If pricing-affecting fields changed, rebuild charges from the fresh row.
  if (
    patch.billableDays !== undefined ||
    patch.dailyRate !== undefined ||
    patch.insuranceAmount !== undefined ||
    patch.additionalCharges !== undefined
  ) {
    const fresh = await fetchContract(id);
    if (fresh) await syncCharges(fresh);
  }

  const result = await fetchContract(id);
  if (!result) throw new Error("Contrato no encontrado.");
  return result;
}

export async function deleteContract(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.from("contract_charges").delete().eq("contract_id", id);
  await supabase.from("contract_events").delete().eq("contract_id", id);
  await supabase.from("contract_signatures").delete().eq("contract_id", id);
  await supabase.from("contracts").delete().eq("id", id);
}

/* ------------------------------------------------------------------ */
/* Signing — uploads the signature PNG, writes snapshots + signature row */
/* ------------------------------------------------------------------ */

export interface SignInput {
  token: string;
  signatureDataUrl: string; // "data:image/png;base64,...."
  documentHash?: string;
  userAgent?: string;
}

function dataUrlToBuffer(dataUrl: string): { buffer: Buffer; contentType: string } {
  const match = dataUrl.match(/^data:(.+?);base64,(.*)$/);
  if (!match) throw new Error("Firma inválida.");
  return { contentType: match[1] ?? "image/png", buffer: Buffer.from(match[2] ?? "", "base64") };
}

export async function signContractByToken(input: SignInput): Promise<Contract> {
  const supabase = getSupabaseAdmin();
  const contract = await fetchContractByToken(input.token);
  if (!contract) throw new Error("Contrato no encontrado.");

  // Load live customer/vehicle/business to build immutable snapshots.
  const [{ data: customerRow }, { data: vehicleRow }, { data: tenantRow }] =
    await Promise.all([
      supabase.from("customers").select("*").eq("id", contract.customerId).single(),
      supabase.from("vehicles").select("*").eq("id", contract.vehicleId).single(),
      supabase.from("tenants").select("*").eq("id", AYBAR_TENANT_ID).single(),
    ]);

  const signedAt = new Date().toISOString();
  const sigId = crypto.randomUUID();
  const path = `${AYBAR_TENANT_ID}/${contract.id}/${sigId}/signature.png`;
  const { buffer, contentType } = dataUrlToBuffer(input.signatureDataUrl);

  const up = await supabase.storage
    .from(BUCKETS.contractSignatures)
    .upload(path, buffer, { contentType, upsert: true });
  if (up.error) throw new Error(`Error subiendo firma: ${up.error.message}`);

  // Build JSONB snapshots (snake_case, matching existing rows).
  const cr = customerRow as Record<string, unknown> | null;
  const vr = vehicleRow as Record<string, unknown> | null;
  const tr = tenantRow as Record<string, unknown> | null;

  const customer_snapshot = cr && {
    full_name: cr.full_name,
    phone: cr.phone,
    email: cr.email,
    date_of_birth: cr.date_of_birth,
    country: cr.country,
    city: cr.city,
    address_line1: cr.address_line1,
    passport_number: cr.passport_number,
    driver_license_number: cr.driver_license_number,
    driver_license_country: cr.driver_license_country,
    driver_license_expiration: cr.driver_license_expiration,
  };
  const vehicle_snapshot = vr && {
    brand: vr.brand,
    model: vr.model,
    year: vr.year,
    color: vr.color,
    plate: vr.plate,
    vin: vr.vin,
    fleet_number: vr.fleet_number,
  };
  const business_snapshot = tr && {
    business_name: tr.business_name,
    legal_name: tr.legal_name,
    email: tr.email,
    primary_phone: tr.primary_phone,
    address: tr.address,
    currency: tr.currency,
    tax_id: tr.tax_id,
  };
  const pricing_snapshot = {
    pickup_location: contract.pickupLocation,
    return_location: contract.returnLocation,
    billable_days: contract.billableDays,
    daily_rate: contract.dailyRate,
    insurance_amount: contract.insuranceAmount,
    discount_amount: contract.discountAmount,
    deposit_amount: contract.depositAmount,
    subtotal: contract.subtotal,
    tax_amount: contract.taxAmount,
    total_amount: contract.total,
    currency: "USD",
  };

  await supabase
    .from("contracts")
    .update({
      status: "SIGNED",
      signed_at: signedAt,
      customer_snapshot,
      vehicle_snapshot,
      business_snapshot,
      pricing_snapshot,
    })
    .eq("id", contract.id);

  const signerName = (cr?.full_name as string) ?? contract.id;
  const { first } = splitName(signerName);
  void first;

  await supabase.from("contract_signatures").insert({
    id: sigId,
    tenant_id: AYBAR_TENANT_ID,
    contract_id: contract.id,
    signer_type: "CUSTOMER",
    signer_name: signerName,
    signature_storage_path: path,
    signed_at: signedAt,
    user_agent: input.userAgent ?? null,
    document_version: 1,
    document_hash: input.documentHash ?? null,
  });

  await appendEvent(contract.id, "CONTRACT_SIGNED", signerName, "Contrato firmado digitalmente.");

  const result = await fetchContract(contract.id);
  if (!result) throw new Error("No se pudo leer el contrato firmado.");
  return result;
}
