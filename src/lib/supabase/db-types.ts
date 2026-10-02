/** Row shapes for the existing Supabase schema (snake_case, as returned by PostgREST). */

export interface TenantRow {
  id: string;
  slug: string;
  business_name: string;
  legal_name: string | null;
  tax_id: string | null;
  email: string | null;
  primary_phone: string | null;
  secondary_phone: string | null;
  address: string | null;
  country: string | null;
  currency: string | null;
  timezone: string | null;
  status: string;
}

export interface TenantSettingsRow {
  tenant_id: string;
  logo_path: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  contract_prefix: string | null;
  next_contract_number: number | null;
  default_currency: string | null;
  default_tax_rate: number | null;
  contract_terms: string | null;
}

export interface CustomerRow {
  id: string;
  tenant_id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string;
  phone: string | null;
  secondary_phone: string | null;
  email: string | null;
  date_of_birth: string | null;
  passport_number: string | null;
  passport_country: string | null;
  driver_license_number: string | null;
  driver_license_country: string | null;
  driver_license_state: string | null;
  driver_license_expiration: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  local_address: string | null;
  company_name: string | null;
  company_phone: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleRow {
  id: string;
  tenant_id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  color: string | null;
  vin: string | null;
  fleet_number: string | null;
  current_mileage: number | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContractRow {
  id: string;
  tenant_id: string;
  contract_number: number;
  customer_id: string;
  vehicle_id: string;
  status: string;
  pickup_at: string;
  return_at: string;
  billable_days: number;
  daily_rate: number;
  insurance_amount: number;
  discount_amount: number;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  deposit_amount: number;
  currency: string;
  notes: string | null;
  customer_snapshot: Record<string, unknown> | null;
  vehicle_snapshot: Record<string, unknown> | null;
  business_snapshot: Record<string, unknown> | null;
  pricing_snapshot: Record<string, unknown> | null;
  public_token: string | null;
  public_token_expires_at: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  signed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContractChargeRow {
  id: string;
  tenant_id: string;
  contract_id: string;
  type: string;
  description: string | null;
  quantity: number;
  unit_amount: number;
  total_amount: number;
}

export interface ContractEventRow {
  id: string;
  tenant_id: string;
  contract_id: string;
  event_type: string;
  actor_type: string | null;
  actor_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface ContractSignatureRow {
  id: string;
  tenant_id: string;
  contract_id: string;
  signer_type: string;
  signer_name: string | null;
  signature_storage_path: string | null;
  signed_at: string | null;
  document_version: number | null;
  document_hash: string | null;
}

export interface CustomerDocumentRow {
  id: string;
  tenant_id: string;
  customer_id: string;
  document_type: string;
  storage_path: string;
  original_filename: string | null;
  mime_type: string | null;
  expiration_date: string | null;
  created_at: string;
}

export interface AmenityRow {
  id: string;
  tenant_id: string;
  name: string;
  icon: string;
  category: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface VehicleAmenityRow {
  id: string;
  tenant_id: string;
  vehicle_id: string;
  amenity_id: string;
}

export interface VehiclePhotoRow {
  id: string;
  tenant_id: string;
  vehicle_id: string;
  storage_path: string;
  original_filename: string | null;
  mime_type: string | null;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface LocationRow {
  id: string;
  tenant_id: string;
  name: string;
  address: string | null;
  type: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
