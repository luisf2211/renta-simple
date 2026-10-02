"use client";

import type { Contract, ContractEventType, Tenant, Vehicle, VehiclePhoto } from "@/types";
import { api } from "./api-client";

/**
 * Supabase-only operations that don't fit the base CRUD repository interfaces
 * (signing, document upload, event logging). The store exposes equivalent
 * mock behaviour locally; in Supabase mode these persist to the backend.
 */
export const supabaseOps = {
  signByToken(input: {
    token: string;
    signatureDataUrl: string;
    documentHash?: string;
    userAgent?: string;
  }): Promise<Contract> {
    return api.post<Contract>(
      `/contracts/by-token/${encodeURIComponent(input.token)}/sign`,
      input,
    );
  },

  uploadCustomerDocument(input: {
    customerId: string;
    documentType:
      | "DRIVER_LICENSE_FRONT"
      | "DRIVER_LICENSE_BACK"
      | "PASSPORT"
      | "IDENTIFICATION"
      | "OTHER";
    dataUrl: string;
    fileName?: string;
  }): Promise<{ dataUrl: string; fileName?: string }> {
    return api.post(`/customers/${input.customerId}/documents`, input);
  },

  appendEvent(input: {
    contractId: string;
    type: ContractEventType;
    actor: string;
    description: string;
  }): Promise<{ ok: boolean }> {
    return api.post(`/contracts/${input.contractId}/events`, {
      type: input.type,
      actor: input.actor,
      description: input.description,
    });
  },

  // --- Tenant branding / config ---
  updateTenant(patch: Partial<Tenant>): Promise<Tenant> {
    return api.patch<Tenant>("/tenant", patch);
  },
  uploadTenantLogo(input: { dataUrl: string; fileName?: string }): Promise<Tenant> {
    return api.post<Tenant>("/tenant/logo", input);
  },

  // --- Vehicle photos + amenities ---
  uploadVehiclePhoto(input: {
    vehicleId: string;
    dataUrl: string;
    fileName?: string;
    isPrimary?: boolean;
  }): Promise<VehiclePhoto> {
    return api.post<VehiclePhoto>(`/vehicles/${input.vehicleId}/photos`, {
      dataUrl: input.dataUrl,
      fileName: input.fileName,
      isPrimary: input.isPrimary,
    });
  },
  deleteVehiclePhoto(vehicleId: string, photoId: string): Promise<{ ok: boolean }> {
    return api.del(`/vehicles/${vehicleId}/photos/${photoId}`);
  },
  setPrimaryVehiclePhoto(vehicleId: string, photoId: string): Promise<Vehicle> {
    return api.post<Vehicle>(`/vehicles/${vehicleId}/photos/${photoId}/primary`, {});
  },
  setVehicleAmenities(vehicleId: string, amenityIds: string[]): Promise<Vehicle> {
    return api.post<Vehicle>(`/vehicles/${vehicleId}/amenities`, { amenityIds });
  },
};
