export type LocationType = "AIRPORT" | "OFFICE" | "HOTEL" | "OTHER";

export interface Location {
  id: string;
  name: string;
  address?: string;
  type: LocationType;
  isActive: boolean;
  sortOrder: number;
}

export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  AIRPORT: "Aeropuerto",
  OFFICE: "Oficina",
  HOTEL: "Hotel",
  OTHER: "Otro",
};

export const LOCATION_TYPE_ICONS: Record<LocationType, string> = {
  AIRPORT: "Plane",
  OFFICE: "Building2",
  HOTEL: "Hotel",
  OTHER: "MapPin",
};
