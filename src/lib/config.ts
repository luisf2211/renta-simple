export type DataSource = "mock" | "supabase";

/**
 * Selects where the app reads/writes data. Set NEXT_PUBLIC_DATA_SOURCE in
 * .env.local to "supabase" to use the real backend, or "mock" to keep the
 * fully-offline prototype. Defaults to "mock" so nothing breaks without env.
 */
export const DATA_SOURCE: DataSource =
  process.env.NEXT_PUBLIC_DATA_SOURCE === "supabase" ? "supabase" : "mock";

export const IS_SUPABASE = DATA_SOURCE === "supabase";
