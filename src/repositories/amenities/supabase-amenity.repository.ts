"use client";

import type { Amenity } from "@/types";
import type { AmenityRepository } from "./amenity.repository";
import { api } from "../api-client";

export function createSupabaseAmenityRepository(): AmenityRepository {
  return {
    list() {
      return api.get<Amenity[]>("/amenities");
    },
    create(amenity) {
      return api.post<Amenity>("/amenities", amenity);
    },
    update(id, patch) {
      return api.patch<Amenity>(`/amenities/${id}`, patch);
    },
    async remove(id) {
      await api.del(`/amenities/${id}`);
    },
  };
}
