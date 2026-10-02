export type AmenityCategory =
  | "COMFORT"
  | "SAFETY"
  | "CONNECTIVITY"
  | "CAPACITY"
  | "OTHER";

export interface Amenity {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  category: AmenityCategory;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

export const AMENITY_CATEGORY_LABELS: Record<AmenityCategory, string> = {
  COMFORT: "Confort",
  SAFETY: "Seguridad",
  CONNECTIVITY: "Conectividad",
  CAPACITY: "Capacidad",
  OTHER: "Otros",
};

export const AMENITY_CATEGORY_ORDER: AmenityCategory[] = [
  "CONNECTIVITY",
  "COMFORT",
  "SAFETY",
  "CAPACITY",
  "OTHER",
];
