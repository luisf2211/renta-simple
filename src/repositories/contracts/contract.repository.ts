import type { Contract } from "@/types";

/**
 * Repository contract (interface) for contracts. The UI depends ONLY on this
 * abstraction, never on where the data physically lives. Today it is backed by
 * MockContractRepository (in-memory + localStorage via the demo store); later
 * a SupabaseContractRepository can implement the same interface with zero UI
 * changes.
 */
export interface ContractRepository {
  list(): Promise<Contract[]>;
  getById(id: string): Promise<Contract | null>;
  getByToken(token: string): Promise<Contract | null>;
  create(contract: Contract): Promise<Contract>;
  update(id: string, patch: Partial<Contract>): Promise<Contract>;
  remove(id: string): Promise<void>;
}
