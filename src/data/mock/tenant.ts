import type { Tenant } from "@/types";

export const mockTenant: Tenant = {
  id: "tenant_aybar",
  businessName: "Aybar Rent Car",
  legalName: "Aybar Rent Car, SRL",
  logo: "AYBAR",
  primaryColor: "#e5312f",
  secondaryColor: "#1f2328",
  email: "reservas@aybarrentcar.com",
  phone: "+1 809-555-1234",
  address: "Santo Domingo, República Dominicana",
  country: "República Dominicana",
  currency: "USD",
  timezone: "America/Santo_Domingo",
  contractPrefix: "AR",
  website: "www.aybarrentcar.com",
  contractTerms: [
    {
      title: "Objeto del contrato",
      body: "El presente contrato establece los términos y condiciones para el alquiler del vehículo descrito en la página anterior, entre Aybar Rent Car (en adelante, \"la empresa\") y el arrendatario (en adelante, \"el cliente\").",
    },
    {
      title: "Uso del vehículo",
      body: "El vehículo será utilizado únicamente para fines personales y dentro del territorio permitido por la empresa. Está prohibido su uso en actividades ilegales, competencias, transporte de mercancía o cualquier uso no autorizado.",
    },
    {
      title: "Responsabilidad del arrendatario",
      body: "El cliente es responsable del vehículo desde el momento de la entrega hasta su devolución, incluyendo pérdidas, daños, multas y cualquier cargo adicional, salvo que esté cubierto por el seguro contratado.",
    },
    {
      title: "Seguro",
      body: "El contrato incluye la cobertura de seguro indicada en la página anterior. El cliente debe cumplir con los deducibles y condiciones establecidas por la empresa y la aseguradora.",
    },
    {
      title: "Depósito",
      body: "Se requiere un depósito al momento de la entrega, el cual será devuelto una vez finalizado el alquiler, siempre que el vehículo sea devuelto en las mismas condiciones y sin cargos pendientes.",
    },
    {
      title: "Combustible",
      body: "El vehículo se entrega con el nivel de combustible indicado y debe ser devuelto en las mismas condiciones, salvo acuerdo diferente.",
    },
    {
      title: "Devolución del vehículo",
      body: "El vehículo debe ser devuelto en la fecha, hora y lugar indicados. Cargos adicionales pueden aplicar en caso de retraso.",
    },
    {
      title: "Aceptación",
      body: "Al firmar este documento, el cliente declara haber leído, entendido y aceptado todas las condiciones del presente contrato.",
    },
  ],
};

export const mockUser = {
  id: "user_christian",
  name: "Christian",
  role: "Administrador",
  initials: "C",
};
