import "server-only";
import { getSupabaseAdmin, AYBAR_TENANT_ID, BUCKETS, DEFAULT_STAFF_PROFILE_ID } from "./server";
import {
  mapContract,
  mapCustomer,
  mapTenant,
  mapVehicle,
  mapAmenity,
  mapLocation,
  mapVehiclePhoto,
  documentTypeToSlot,
  type ContractMapExtras,
} from "./mappers";
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
import type {
  Amenity,
  Location,
  Contract,
  Customer,
  StoredImage,
  Tenant,
  Vehicle,
  VehiclePhoto,
} from "@/types";

const SIGNED_URL_TTL = 60 * 60; // 1 hour

/* ------------------------------------------------------------------ */
/* Signed URL helpers                                                  */
/* ------------------------------------------------------------------ */

async function signedUrl(bucket: string, path: string | null): Promise<string | undefined> {
  if (!path) return undefined;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (error || !data?.signedUrl) return undefined;
  return data.signedUrl;
}

async function signedImage(
  bucket: string,
  row: { storage_path: string; original_filename?: string | null } | null,
): Promise<StoredImage | undefined> {
  if (!row) return undefined;
  const url = await signedUrl(bucket, row.storage_path);
  if (!url) return undefined;
  return { dataUrl: url, fileName: row.original_filename ?? undefined };
}

/* ------------------------------------------------------------------ */
/* Tenant                                                              */
/* ------------------------------------------------------------------ */

export async function fetchTenant(): Promise<Tenant> {
  const supabase = getSupabaseAdmin();
  const [{ data: tenant }, { data: settings }] = await Promise.all([
    supabase.from("tenants").select("*").eq("id", AYBAR_TENANT_ID).single(),
    supabase.from("tenant_settings").select("*").eq("tenant_id", AYBAR_TENANT_ID).maybeSingle(),
  ]);
  if (!tenant) throw new Error("Tenant no encontrado.");

  // Logo label: derive a short wordmark from business name (no binary asset).
  const label = (tenant as TenantRow).business_name
    .replace(/rent\s*car/i, "")
    .trim()
    .toUpperCase() || "AYBAR";

  const settingsRow = (settings as TenantSettingsRow) ?? null;
  const logoUrl = settingsRow?.logo_path
    ? await signedUrl(BUCKETS.tenantAssets, settingsRow.logo_path)
    : undefined;

  return mapTenant(tenant as TenantRow, settingsRow, label, logoUrl);
}

/** Update editable tenant fields. */
export async function updateTenant(patch: Partial<Tenant>): Promise<Tenant> {
  const supabase = getSupabaseAdmin();
  const { tenantToRow } = await import("./mappers");
  const row = tenantToRow(patch);
  if (Object.keys(row).length) {
    const { error } = await supabase.from("tenants").update(row).eq("id", AYBAR_TENANT_ID);
    if (error) throw new Error(error.message);
  }
  return fetchTenant();
}

/** Upload a new tenant logo to tenant-assets and update tenant_settings.logo_path. */
export async function uploadTenantLogo(input: {
  dataUrl: string;
  fileName?: string;
}): Promise<Tenant> {
  const supabase = getSupabaseAdmin();
  const match = input.dataUrl.match(/^data:(.+?);base64,(.*)$/);
  if (!match) throw new Error("Logo inválido.");
  const contentType = match[1] ?? "image/png";
  const buffer = Buffer.from(match[2] ?? "", "base64");
  const ext = contentType.includes("png") ? "png" : contentType.includes("svg") ? "svg" : "jpg";
  const path = `${AYBAR_TENANT_ID}/branding/logo.${ext}`;

  const up = await supabase.storage
    .from(BUCKETS.tenantAssets)
    .upload(path, buffer, { contentType, upsert: true });
  if (up.error) throw new Error(up.error.message);

  await supabase
    .from("tenant_settings")
    .update({ logo_path: path })
    .eq("tenant_id", AYBAR_TENANT_ID);

  return fetchTenant();
}

async function fetchSettings(): Promise<TenantSettingsRow | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("tenant_settings")
    .select("*")
    .eq("tenant_id", AYBAR_TENANT_ID)
    .maybeSingle();
  return (data as TenantSettingsRow) ?? null;
}

/* ------------------------------------------------------------------ */
/* Customers                                                           */
/* ------------------------------------------------------------------ */

async function customerImages(customerId: string): Promise<{
  licenseFront?: StoredImage;
  licenseBack?: StoredImage;
  passport?: StoredImage;
}> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("customer_documents")
    .select("*")
    .eq("customer_id", customerId);
  const rows = (data as CustomerDocumentRow[]) ?? [];
  const out: { licenseFront?: StoredImage; licenseBack?: StoredImage; passport?: StoredImage } = {};
  for (const r of rows) {
    const slot = documentTypeToSlot(r.document_type);
    if (!slot) continue;
    const img = await signedImage(BUCKETS.customerDocuments, r);
    if (img) out[slot] = img;
  }
  return out;
}

export async function fetchCustomers(): Promise<Customer[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("customers")
    .select("*")
    .eq("tenant_id", AYBAR_TENANT_ID)
    .order("created_at", { ascending: false });
  const rows = (data as CustomerRow[]) ?? [];
  // List view doesn't need the heavy signed URLs; load images per detail call.
  return rows.map((r) => mapCustomer(r));
}

export async function fetchCustomer(id: string): Promise<Customer | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("customers").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  const images = await customerImages(id);
  return mapCustomer(data as CustomerRow, images);
}

export async function createCustomer(input: Partial<Customer>): Promise<Customer> {
  const supabase = getSupabaseAdmin();
  const { customerToRow } = await import("./mappers");
  const row = customerToRow(input);
  const { data, error } = await supabase
    .from("customers")
    .insert({
      ...row,
      tenant_id: AYBAR_TENANT_ID,
      status: "ACTIVE",
      created_by: DEFAULT_STAFF_PROFILE_ID,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapCustomer(data as CustomerRow);
}

export async function updateCustomer(id: string, patch: Partial<Customer>): Promise<Customer> {
  const supabase = getSupabaseAdmin();
  const { customerToRow } = await import("./mappers");
  const row = customerToRow(patch);
  const { data, error } = await supabase
    .from("customers")
    .update(row)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  const images = await customerImages(id);
  return mapCustomer(data as CustomerRow, images);
}

/* ------------------------------------------------------------------ */
/* Vehicles                                                            */
/* ------------------------------------------------------------------ */

async function vehiclePhotos(vehicleId: string): Promise<VehiclePhoto[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("vehicle_photos")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true });
  const rows = (data as VehiclePhotoRow[]) ?? [];
  const out: VehiclePhoto[] = [];
  for (const r of rows) {
    const url = await signedUrl(BUCKETS.vehiclePhotos, r.storage_path);
    if (url) out.push(mapVehiclePhoto(r, url));
  }
  return out;
}

async function vehicleAmenities(vehicleId: string): Promise<Amenity[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("vehicle_amenities")
    .select("amenity_id, amenities(*)")
    .eq("vehicle_id", vehicleId);
  const rows = (data as { amenities: AmenityRow | null }[] | null) ?? [];
  return rows
    .map((r) => r.amenities)
    .filter((a): a is AmenityRow => !!a)
    .map(mapAmenity)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

async function vehicleExtras(vehicleId: string): Promise<{
  photos: VehiclePhoto[];
  amenities: Amenity[];
}> {
  const [photos, amenities] = await Promise.all([
    vehiclePhotos(vehicleId),
    vehicleAmenities(vehicleId),
  ]);
  return { photos, amenities };
}

export async function fetchVehicles(): Promise<Vehicle[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("vehicles")
    .select("*")
    .eq("tenant_id", AYBAR_TENANT_ID)
    .order("fleet_number", { ascending: true });
  const rows = (data as VehicleRow[]) ?? [];
  return Promise.all(rows.map(async (r) => mapVehicle(r, await vehicleExtras(r.id))));
}

export async function fetchVehicle(id: string): Promise<Vehicle | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("vehicles").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  return mapVehicle(data as VehicleRow, await vehicleExtras(id));
}

export async function updateVehicle(id: string, patch: Partial<Vehicle>): Promise<Vehicle> {
  const supabase = getSupabaseAdmin();
  const { vehicleToRow } = await import("./mappers");
  const { error } = await supabase
    .from("vehicles")
    .update(vehicleToRow(patch))
    .eq("id", id);
  if (error) throw new Error(error.message);
  // Persist amenity selection if provided.
  if (patch.amenityIds) {
    await setVehicleAmenities(id, patch.amenityIds);
  }
  const fresh = await fetchVehicle(id);
  if (!fresh) throw new Error("Vehículo no encontrado");
  return fresh;
}

/** Replace the vehicle's amenity selection. */
export async function setVehicleAmenities(
  vehicleId: string,
  amenityIds: string[],
): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.from("vehicle_amenities").delete().eq("vehicle_id", vehicleId);
  if (amenityIds.length) {
    await supabase.from("vehicle_amenities").insert(
      amenityIds.map((amenity_id) => ({
        tenant_id: AYBAR_TENANT_ID,
        vehicle_id: vehicleId,
        amenity_id,
      })),
    );
  }
}

/* ------------------------------------------------------------------ */
/* Contracts                                                           */
/* ------------------------------------------------------------------ */

async function assembleContract(
  row: ContractRow,
  settings: TenantSettingsRow | null,
  tenant: Tenant,
  opts: { withImages: boolean },
): Promise<Contract> {
  const supabase = getSupabaseAdmin();
  const [{ data: charges }, { data: events }, { data: signatures }] = await Promise.all([
    supabase.from("contract_charges").select("*").eq("contract_id", row.id),
    supabase.from("contract_events").select("*").eq("contract_id", row.id).order("created_at", { ascending: true }),
    supabase.from("contract_signatures").select("*").eq("contract_id", row.id),
  ]);

  const sigRows = (signatures as ContractSignatureRow[]) ?? [];
  const customerSig = sigRows.find((s) => s.signer_type === "CUSTOMER");
  const repSig = sigRows.find((s) => s.signer_type === "BUSINESS_REPRESENTATIVE");

  let signatureImageUrl: string | undefined;
  let representativeSignatureUrl: string | undefined;
  let customerLicenseFront: StoredImage | undefined;
  let customerLicenseBack: StoredImage | undefined;
  let vehicleImage: string | undefined;

  let vehiclePhotoUrls: string[] = [];
  let vehicleAmenityNames: string[] = [];

  if (opts.withImages) {
    signatureImageUrl = await signedUrl(BUCKETS.contractSignatures, customerSig?.signature_storage_path ?? null);
    representativeSignatureUrl = await signedUrl(BUCKETS.contractSignatures, repSig?.signature_storage_path ?? null);
    const imgs = await customerImages(row.customer_id);
    customerLicenseFront = imgs.licenseFront;
    customerLicenseBack = imgs.licenseBack;
    const vx = await vehicleExtras(row.vehicle_id);
    vehicleImage = vx.photos.find((p) => p.isPrimary)?.url ?? vx.photos[0]?.url;
    vehiclePhotoUrls = vx.photos.map((p) => p.url);
    vehicleAmenityNames = vx.amenities.map((a) => a.name);
  }

  const extras: ContractMapExtras = {
    prefix: settings?.contract_prefix ?? "AR",
    charges: (charges as ContractChargeRow[]) ?? [],
    events: (events as ContractEventRow[]) ?? [],
    signature: customerSig,
    signatureImageUrl,
    representativeSignatureUrl,
    customerLicenseFront,
    customerLicenseBack,
    vehicleImage,
    vehiclePhotoUrls,
    vehicleAmenityNames,
    taxRate: settings?.default_tax_rate ?? 0,
    contractTerms: tenant.contractTerms,
  };
  return mapContract(row, extras);
}

export async function fetchContracts(): Promise<Contract[]> {
  const supabase = getSupabaseAdmin();
  const [settings, tenant] = await Promise.all([fetchSettings(), fetchTenant()]);
  const { data } = await supabase
    .from("contracts")
    .select("*")
    .eq("tenant_id", AYBAR_TENANT_ID)
    .order("contract_number", { ascending: false });
  const rows = (data as ContractRow[]) ?? [];
  // List view: skip signed URLs (lighter + faster). Images loaded on detail.
  return Promise.all(rows.map((r) => assembleContract(r, settings, tenant, { withImages: false })));
}

export async function fetchContract(id: string): Promise<Contract | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("contracts").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  const [settings, tenant] = await Promise.all([fetchSettings(), fetchTenant()]);
  return assembleContract(data as ContractRow, settings, tenant, { withImages: true });
}

export async function fetchContractByToken(token: string): Promise<Contract | null> {
  const supabase = getSupabaseAdmin();
  // Primary: match the public link token.
  let { data } = await supabase
    .from("contracts")
    .select("*")
    .eq("public_token", token)
    .maybeSingle();

  // Fallback: some contracts have no public_token yet; the app then uses the
  // contract id as the token. Resolve those by id (UUID-shaped tokens only).
  if (!data && /^[0-9a-f-]{36}$/i.test(token)) {
    const byId = await supabase
      .from("contracts")
      .select("*")
      .eq("id", token)
      .maybeSingle();
    data = byId.data;
  }

  if (!data) return null;
  const [settings, tenant] = await Promise.all([fetchSettings(), fetchTenant()]);
  return assembleContract(data as ContractRow, settings, tenant, { withImages: true });
}

/* ------------------------------------------------------------------ */
/* Customer document upload (license/passport photos)                   */
/* ------------------------------------------------------------------ */

export type CustomerDocType =
  | "DRIVER_LICENSE_FRONT"
  | "DRIVER_LICENSE_BACK"
  | "PASSPORT"
  | "IDENTIFICATION"
  | "OTHER";

function dataUrlToBuffer(dataUrl: string): { buffer: Buffer; contentType: string } {
  const match = dataUrl.match(/^data:(.+?);base64,(.*)$/);
  if (!match) throw new Error("Imagen inválida.");
  return { contentType: match[1] ?? "image/jpeg", buffer: Buffer.from(match[2] ?? "", "base64") };
}

const DOC_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Uploads a customer document photo to the private bucket and upserts the
 * customer_documents row (one row per document_type). Returns a signed URL.
 */
export async function uploadCustomerDocument(input: {
  customerId: string;
  documentType: CustomerDocType;
  dataUrl: string;
  fileName?: string;
}): Promise<StoredImage> {
  const supabase = getSupabaseAdmin();
  const { buffer, contentType } = dataUrlToBuffer(input.dataUrl);
  const ext = DOC_EXT[contentType] ?? "jpg";
  const path = `${AYBAR_TENANT_ID}/${input.customerId}/${input.documentType.toLowerCase()}.${ext}`;

  const up = await supabase.storage
    .from(BUCKETS.customerDocuments)
    .upload(path, buffer, { contentType, upsert: true });
  if (up.error) throw new Error(up.error.message);

  // Upsert the row (delete any existing of same type first for simplicity).
  await supabase
    .from("customer_documents")
    .delete()
    .eq("customer_id", input.customerId)
    .eq("document_type", input.documentType);
  await supabase.from("customer_documents").insert({
    tenant_id: AYBAR_TENANT_ID,
    customer_id: input.customerId,
    document_type: input.documentType,
    storage_path: path,
    original_filename: input.fileName ?? null,
    mime_type: contentType,
  });

  const url = await signedUrl(BUCKETS.customerDocuments, path);
  return { dataUrl: url ?? "", fileName: input.fileName };
}

/* ------------------------------------------------------------------ */
/* Amenities (catalogue)                                               */
/* ------------------------------------------------------------------ */

export async function fetchAmenities(): Promise<Amenity[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("amenities")
    .select("*")
    .eq("tenant_id", AYBAR_TENANT_ID)
    .order("sort_order", { ascending: true });
  return ((data as AmenityRow[]) ?? []).map(mapAmenity);
}

export async function createAmenity(input: Partial<Amenity>): Promise<Amenity> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("amenities")
    .insert({
      tenant_id: AYBAR_TENANT_ID,
      name: input.name ?? "Nueva amenidad",
      icon: input.icon ?? "Check",
      category: input.category ?? "OTHER",
      description: input.description ?? null,
      is_active: input.isActive ?? true,
      sort_order: input.sortOrder ?? 999,
      created_by: DEFAULT_STAFF_PROFILE_ID,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapAmenity(data as AmenityRow);
}

export async function updateAmenity(id: string, patch: Partial<Amenity>): Promise<Amenity> {
  const supabase = getSupabaseAdmin();
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.icon !== undefined) row.icon = patch.icon;
  if (patch.category !== undefined) row.category = patch.category;
  if (patch.description !== undefined) row.description = patch.description || null;
  if (patch.isActive !== undefined) row.is_active = patch.isActive;
  if (patch.sortOrder !== undefined) row.sort_order = patch.sortOrder;
  const { data, error } = await supabase
    .from("amenities")
    .update(row)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapAmenity(data as AmenityRow);
}

export async function deleteAmenity(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.from("vehicle_amenities").delete().eq("amenity_id", id);
  const { error } = await supabase.from("amenities").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* ------------------------------------------------------------------ */
/* Vehicle photos                                                      */
/* ------------------------------------------------------------------ */

function dataUrlParts(dataUrl: string): { buffer: Buffer; contentType: string; ext: string } {
  const match = dataUrl.match(/^data:(.+?);base64,(.*)$/);
  if (!match) throw new Error("Imagen inválida.");
  const contentType = match[1] ?? "image/jpeg";
  const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  return { buffer: Buffer.from(match[2] ?? "", "base64"), contentType, ext };
}

export async function uploadVehiclePhoto(input: {
  vehicleId: string;
  dataUrl: string;
  fileName?: string;
  isPrimary?: boolean;
}): Promise<VehiclePhoto> {
  const supabase = getSupabaseAdmin();
  const { buffer, contentType, ext } = dataUrlParts(input.dataUrl);
  const photoId = crypto.randomUUID();
  const path = `${AYBAR_TENANT_ID}/${input.vehicleId}/${photoId}.${ext}`;

  const up = await supabase.storage
    .from(BUCKETS.vehiclePhotos)
    .upload(path, buffer, { contentType, upsert: true });
  if (up.error) throw new Error(up.error.message);

  // Determine if this should be primary: explicit, or first photo of the vehicle.
  const { data: existing } = await supabase
    .from("vehicle_photos")
    .select("id")
    .eq("vehicle_id", input.vehicleId);
  const isFirst = ((existing as unknown[]) ?? []).length === 0;
  const makePrimary = input.isPrimary ?? isFirst;

  if (makePrimary) {
    await supabase
      .from("vehicle_photos")
      .update({ is_primary: false })
      .eq("vehicle_id", input.vehicleId);
  }

  const { data, error } = await supabase
    .from("vehicle_photos")
    .insert({
      id: photoId,
      tenant_id: AYBAR_TENANT_ID,
      vehicle_id: input.vehicleId,
      storage_path: path,
      original_filename: input.fileName ?? null,
      mime_type: contentType,
      is_primary: makePrimary,
      sort_order: 0,
      created_by: DEFAULT_STAFF_PROFILE_ID,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  const url = await signedUrl(BUCKETS.vehiclePhotos, path);
  return mapVehiclePhoto(data as VehiclePhotoRow, url ?? "");
}

export async function deleteVehiclePhoto(photoId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("vehicle_photos")
    .select("storage_path, vehicle_id, is_primary")
    .eq("id", photoId)
    .maybeSingle();
  const row = data as { storage_path: string; vehicle_id: string; is_primary: boolean } | null;
  if (!row) return;
  await supabase.storage.from(BUCKETS.vehiclePhotos).remove([row.storage_path]);
  await supabase.from("vehicle_photos").delete().eq("id", photoId);
  // If we removed the primary, promote another photo.
  if (row.is_primary) {
    const { data: rest } = await supabase
      .from("vehicle_photos")
      .select("id")
      .eq("vehicle_id", row.vehicle_id)
      .limit(1);
    const next = (rest as { id: string }[] | null)?.[0];
    if (next) {
      await supabase.from("vehicle_photos").update({ is_primary: true }).eq("id", next.id);
    }
  }
}

export async function setPrimaryVehiclePhoto(photoId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("vehicle_photos")
    .select("vehicle_id")
    .eq("id", photoId)
    .maybeSingle();
  const row = data as { vehicle_id: string } | null;
  if (!row) return;
  await supabase
    .from("vehicle_photos")
    .update({ is_primary: false })
    .eq("vehicle_id", row.vehicle_id);
  await supabase.from("vehicle_photos").update({ is_primary: true }).eq("id", photoId);
}

/* ------------------------------------------------------------------ */
/* Locations (pickup / return catalogue)                               */
/* ------------------------------------------------------------------ */

export async function fetchLocations(): Promise<Location[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("locations")
    .select("*")
    .eq("tenant_id", AYBAR_TENANT_ID)
    .order("sort_order", { ascending: true });
  return ((data as LocationRow[]) ?? []).map(mapLocation);
}

export async function createLocation(input: Partial<Location>): Promise<Location> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("locations")
    .insert({
      tenant_id: AYBAR_TENANT_ID,
      name: input.name ?? "Nueva ubicación",
      address: input.address ?? null,
      type: input.type ?? "OFFICE",
      is_active: input.isActive ?? true,
      sort_order: input.sortOrder ?? 999,
      created_by: DEFAULT_STAFF_PROFILE_ID,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapLocation(data as LocationRow);
}

export async function updateLocation(id: string, patch: Partial<Location>): Promise<Location> {
  const supabase = getSupabaseAdmin();
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.address !== undefined) row.address = patch.address || null;
  if (patch.type !== undefined) row.type = patch.type;
  if (patch.isActive !== undefined) row.is_active = patch.isActive;
  if (patch.sortOrder !== undefined) row.sort_order = patch.sortOrder;
  const { data, error } = await supabase
    .from("locations")
    .update(row)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapLocation(data as LocationRow);
}

export async function deleteLocation(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("locations").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
