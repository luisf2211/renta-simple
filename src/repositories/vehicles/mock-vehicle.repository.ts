import type { Vehicle } from "@/types";
import type { VehicleRepository } from "./vehicle.repository";
import type { DemoData } from "@/store/demo-data";

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

export function createMockVehicleRepository(
  getData: () => DemoData,
  setVehicles: (updater: (prev: Vehicle[]) => Vehicle[]) => void,
): VehicleRepository {
  return {
    async list() {
      await delay(100);
      return getData().vehicles;
    },
    async getById(id) {
      await delay(60);
      return getData().vehicles.find((v) => v.id === id) ?? null;
    },
    async update(id, patch) {
      await delay();
      let updated: Vehicle | undefined;
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.id !== id) return v;
          updated = { ...v, ...patch };
          return updated;
        }),
      );
      const result = updated ?? getData().vehicles.find((v) => v.id === id);
      if (!result) throw new Error(`Vehículo no encontrado: ${id}`);
      return result;
    },
  };
}
