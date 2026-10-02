"use client";

import type { Location } from "@/types";
import type { LocationRepository } from "./location.repository";
import { api } from "../api-client";

export function createSupabaseLocationRepository(): LocationRepository {
  return {
    list() {
      return api.get<Location[]>("/locations");
    },
    create(location) {
      return api.post<Location>("/locations", location);
    },
    update(id, patch) {
      return api.patch<Location>(`/locations/${id}`, patch);
    },
    async remove(id) {
      await api.del(`/locations/${id}`);
    },
  };
}
