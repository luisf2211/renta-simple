export * from "./tenant";
export * from "./customer";
export * from "./vehicle";
export * from "./contract";
export * from "./amenity";
export * from "./location";

import type { ContractStatus } from "./contract";
import type { VehicleStatus, Transmission } from "./vehicle";
import type { ContractEventType } from "./contract";

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  DRAFT: "Borrador",
  SENT: "Enviado",
  VIEWED: "Visto",
  CHANGES_REQUESTED: "Corrección solicitada",
  SIGNED: "Firmado",
  DELIVERED: "Entregado",
  RETURNED: "Devuelto",
  CLOSED: "Cerrado",
  CANCELLED: "Cancelado",
  EXPIRED: "Expirado",
};

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  AVAILABLE: "Disponible",
  RENTED: "Rentado",
  MAINTENANCE: "Mantenimiento",
};

export const TRANSMISSION_LABELS: Record<Transmission, string> = {
  AUTOMATIC: "Automática",
  MANUAL: "Manual",
};

export const EVENT_LABELS: Record<ContractEventType, string> = {
  CONTRACT_CREATED: "Contrato creado",
  CONTRACT_EDITED: "Contrato editado",
  CONTRACT_SENT: "Contrato enviado",
  CONTRACT_VIEWED: "Contrato visto por el cliente",
  CHANGES_REQUESTED: "Corrección solicitada",
  CUSTOMER_INFO_UPDATED: "Información del cliente actualizada",
  DOCUMENT_UPLOADED: "Documento agregado",
  CONTRACT_SIGNED: "Contrato firmado",
  CONTRACT_DELIVERED: "Vehículo entregado",
  CONTRACT_RETURNED: "Vehículo devuelto",
  CONTRACT_CLOSED: "Contrato cerrado",
  CONTRACT_CANCELLED: "Contrato cancelado",
};
