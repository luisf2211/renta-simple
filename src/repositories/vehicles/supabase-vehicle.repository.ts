"use client";

import type { Vehicle } from "@/types";
import type { VehicleRepository } from "./vehicle.repository";
import { api } from "../api-client";

export function createSupabaseVehicleRepository(): VehicleRepository {
  return {
    list() {
      return api.get<Vehicle[]>("/vehicles");
    },
    getById(id) {
      return api.get<Vehicle>(`/vehicles/${id}`).catch(() => null);
    },
    update(id, patch) {
      return api.patch<Vehicle>(`/vehicles/${id}`, patch);
    },
  };
}
