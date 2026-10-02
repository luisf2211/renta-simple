import type { Customer } from "@/types";
import type { CustomerRepository } from "./customer.repository";
import type { DemoData } from "@/store/demo-data";

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

export function createMockCustomerRepository(
  getData: () => DemoData,
  setCustomers: (updater: (prev: Customer[]) => Customer[]) => void,
): CustomerRepository {
  return {
    async list() {
      await delay(100);
      return getData().customers;
    },
    async getById(id) {
      await delay(60);
      return getData().customers.find((c) => c.id === id) ?? null;
    },
    async create(customer) {
      await delay();
      setCustomers((prev) => [customer, ...prev]);
      return customer;
    },
    async update(id, patch) {
      await delay();
      let updated: Customer | undefined;
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          updated = { ...c, ...patch };
          return updated;
        }),
      );
      const result = updated ?? getData().customers.find((c) => c.id === id);
      if (!result) throw new Error(`Cliente no encontrado: ${id}`);
      return result;
    },
  };
}
