import type { Contract, Customer, Tenant, Vehicle } from "@/types";
import { mockTenant } from "@/data/mock/tenant";
import { mockVehicles } from "@/data/mock/vehicles";
import { mockCustomers } from "@/data/mock/customers";
import { mockContracts } from "@/data/mock/contracts";

export interface DemoData {
  tenant: Tenant;
  vehicles: Vehicle[];
  customers: Customer[];
  contracts: Contract[];
}

export const DEMO_STORAGE_KEY = "aybar-rentcar-demo-v1";
export const DEMO_DATA_VERSION = 1;

/** Fresh deep copy of the seed dataset (used on first load and on reset). */
export function buildSeedData(): DemoData {
  return structuredCloneSafe({
    tenant: mockTenant,
    vehicles: mockVehicles,
    customers: mockCustomers,
    contracts: mockContracts,
  });
}

function structuredCloneSafe<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}
