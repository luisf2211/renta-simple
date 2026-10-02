"use client";

import type { Customer } from "@/types";
import type { CustomerRepository } from "./customer.repository";
import { api } from "../api-client";

export function createSupabaseCustomerRepository(): CustomerRepository {
  return {
    list() {
      return api.get<Customer[]>("/customers");
    },
    getById(id) {
      return api.get<Customer>(`/customers/${id}`).catch(() => null);
    },
    create(customer) {
      return api.post<Customer>("/customers", customer);
    },
    update(id, patch) {
      return api.patch<Customer>(`/customers/${id}`, patch);
    },
  };
}
