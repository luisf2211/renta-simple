export type AdminModule =
  | "contracts"
  | "customers"
  | "vehicles"
  | "users"
  | "settings";

export const MODULE_LABELS: Record<AdminModule, string> = {
  contracts: "Contratos",
  customers: "Clientes",
  vehicles: "Vehículos",
  users: "Usuarios",
  settings: "Configuración",
};
