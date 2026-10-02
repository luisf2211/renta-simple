import type { Amenity } from "@/types";

export interface AmenityRepository {
  list(): Promise<Amenity[]>;
  create(amenity: Partial<Amenity>): Promise<Amenity>;
  update(id: string, patch: Partial<Amenity>): Promise<Amenity>;
  remove(id: string): Promise<void>;
}
