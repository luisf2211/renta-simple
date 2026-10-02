import type { Amenity } from "./amenity";

export type VehicleStatus = "AVAILABLE" | "RENTED" | "MAINTENANCE";

export type Transmission = "AUTOMATIC" | "MANUAL";

export interface VehiclePhoto {
  id: string;
  url: string; // signed URL (Supabase) or data URL (mock)
  storagePath?: string;
  fileName?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  vin: string;
  color: string;
  transmission: Transmission;
  passengers: number;
  fleetNumber: string;
  status: VehicleStatus;
  /** Resolved thumbnail (primary photo URL, or a placeholder). */
  image?: string;
  dailyRate: number;
  /** Full gallery (thumbnail + extras). */
  photos: VehiclePhoto[];
  /** Selected amenity ids. */
  amenityIds: string[];
  /** Resolved amenity objects (for display). */
  amenities: Amenity[];
}
