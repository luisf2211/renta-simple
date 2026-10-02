import type { Vehicle } from "@/types";

export interface VehicleRepository {
  list(): Promise<Vehicle[]>;
  getById(id: string): Promise<Vehicle | null>;
  update(id: string, patch: Partial<Vehicle>): Promise<Vehicle>;
}
