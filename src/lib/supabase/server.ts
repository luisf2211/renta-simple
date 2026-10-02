import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase admin client (service role). It bypasses RLS and must
 * NEVER be imported from client components — the "server-only" guard above
 * throws at build time if that happens. All browser access goes through the
 * Next.js route handlers in app/api/*.
 */
let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.",
    );
  }

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

/** The single demo tenant we operate against in this phase (Aybar). */
export const AYBAR_TENANT_ID = "11111111-1111-1111-1111-111111111111";

/**
 * Default staff profile used as `created_by` while real auth is deferred. This
 * is the existing "Christian" admin profile in the database. Once auth lands,
 * this is replaced by the authenticated user's profile id.
 */
export const DEFAULT_STAFF_PROFILE_ID = "5b98b1ef-5cab-414f-af2f-dc5ed8396cf1";

/** Storage buckets that already exist in the project (all private). */
export const BUCKETS = {
  tenantAssets: "tenant-assets",
  customerDocuments: "customer-documents",
  contractSignatures: "contract-signatures",
  contractDocuments: "contract-documents",
  vehiclePhotos: "vehicle-photos",
  tenantMedia: "tenant-media",
} as const;
