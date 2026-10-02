import type { Customer } from "@/types";

export interface CustomerRepository {
  list(): Promise<Customer[]>;
  getById(id: string): Promise<Customer | null>;
  create(customer: Customer): Promise<Customer>;
  update(id: string, patch: Partial<Customer>): Promise<Customer>;
}
