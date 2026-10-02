import type { Contract } from "@/types";
import type { ContractRepository } from "./contract.repository";
import type { DemoData } from "@/store/demo-data";

const DELAY_MS = 300;
const delay = (ms = DELAY_MS) => new Promise((r) => setTimeout(r, ms));

/**
 * Mock repository backed by the in-memory demo dataset. It reads from a getter
 * and writes through a setter supplied by the demo store, so all mutations go
 * through one place that also persists to localStorage. Swap this out for a
 * Supabase implementation later without touching the UI.
 */
export function createMockContractRepository(
  getData: () => DemoData,
  setContracts: (updater: (prev: Contract[]) => Contract[]) => void,
): ContractRepository {
  return {
    async list() {
      await delay(120);
      return getData().contracts;
    },
    async getById(id) {
      await delay(80);
      return getData().contracts.find((c) => c.id === id) ?? null;
    },
    async getByToken(token) {
      await delay(80);
      return getData().contracts.find((c) => c.token === token) ?? null;
    },
    async create(contract) {
      await delay();
      setContracts((prev) => [contract, ...prev]);
      return contract;
    },
    async update(id, patch) {
      await delay();
      let updated: Contract | undefined;
      setContracts((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          updated = { ...c, ...patch };
          return updated;
        }),
      );
      const result = updated ?? getData().contracts.find((c) => c.id === id);
      if (!result) throw new Error(`Contrato no encontrado: ${id}`);
      return result;
    },
    async remove(id) {
      await delay();
      setContracts((prev) => prev.filter((c) => c.id !== id));
    },
  };
}
