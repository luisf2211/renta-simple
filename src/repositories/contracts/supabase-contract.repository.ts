"use client";

import type { Contract } from "@/types";
import type { ContractRepository } from "./contract.repository";
import { api } from "../api-client";

/**
 * Supabase-backed contract repository. Implements the same interface as the
 * mock repository but reads/writes through the server API. The UI is unaware
 * of which implementation is in use.
 */
export function createSupabaseContractRepository(): ContractRepository {
  return {
    list() {
      return api.get<Contract[]>("/contracts");
    },
    getById(id) {
      return api
        .get<Contract>(`/contracts/${id}`)
        .catch(() => null);
    },
    getByToken(token) {
      return api
        .get<Contract>(`/contracts/by-token/${encodeURIComponent(token)}`)
        .catch(() => null);
    },
    create(contract) {
      return api.post<Contract>("/contracts", contract);
    },
    update(id, patch) {
      return api.patch<Contract>(`/contracts/${id}`, patch);
    },
    async remove(id) {
      await api.del(`/contracts/${id}`);
    },
  };
}
