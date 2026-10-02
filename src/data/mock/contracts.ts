import type {
  Contract,
  ContractEvent,
  SignedSnapshot,
} from "@/types";
import { mockCustomers } from "./customers";
import { mockVehicles } from "./vehicles";
import { mockTenant } from "./tenant";
import {
  SEED_SIGNATURE_CUSTOMER,
  SEED_SIGNATURE_REPRESENTATIVE,
} from "./seed-assets";
import { calculatePricing } from "@/lib/calculations/pricing";

const SDQ = "Aeropuerto Internacional Las Américas (SDQ)";

let eventSeq = 0;
function ev(
  type: ContractEvent["type"],
  at: string,
  actor: string,
  description: string,
): ContractEvent {
  eventSeq += 1;
  return { id: `evt_seed_${eventSeq}`, type, at, actor, description };
}

function priced(
  partial: Omit<Contract, "subtotal" | "taxAmount" | "total" | "events" | "documents"> & {
    events: ContractEvent[];
    documents: Contract["documents"];
  },
): Contract {
  const p = calculatePricing({
    billableDays: partial.billableDays,
    dailyRate: partial.dailyRate,
    insuranceAmount: partial.insuranceAmount,
    discountAmount: partial.discountAmount,
    additionalCharges: partial.additionalCharges,
  });
  return { ...partial, subtotal: p.subtotal, taxAmount: p.taxAmount, total: p.total };
}

// --- SCENARIO C signed snapshot (AR-1056, Carlos Díaz / Kia K5) ------------
const carlos = mockCustomers.find((c) => c.id === "cus_carlos")!;
const k5 = mockVehicles.find((v) => v.id === "veh_k5")!;
const signedSnapshot1056: SignedSnapshot = {
  business: {
    businessName: mockTenant.businessName,
    legalName: mockTenant.legalName,
    logo: mockTenant.logo,
    email: mockTenant.email,
    phone: mockTenant.phone,
    address: mockTenant.address,
    country: mockTenant.country,
    website: mockTenant.website,
  },
  customer: {
    fullName: carlos.fullName,
    phone: carlos.phone,
    email: carlos.email,
    dateOfBirth: carlos.dateOfBirth,
    nationality: carlos.nationality,
    address: carlos.address,
    city: carlos.city,
    country: carlos.country,
    licenseNumber: carlos.licenseNumber,
    licenseCountry: carlos.licenseCountry,
    licenseExpiration: carlos.licenseExpiration,
    licenseFrontImage: carlos.licenseFrontImage,
    licenseBackImage: carlos.licenseBackImage,
  },
  vehicle: {
    brand: k5.brand,
    model: k5.model,
    year: k5.year,
    plate: k5.plate,
    vin: k5.vin,
    color: k5.color,
    transmission: k5.transmission,
    passengers: k5.passengers,
    image: k5.image,
  },
  pricing: {
    billableDays: 3,
    dailyRate: 60,
    insuranceAmount: 50,
    depositAmount: 250,
    discountAmount: 0,
    additionalCharges: [],
    subtotal: 230,
    taxAmount: 0,
    total: 230,
    currency: "USD",
  },
  period: {
    pickupAt: "2026-09-25T14:00:00.000Z",
    returnAt: "2026-09-28T14:00:00.000Z",
    pickupLocation: SDQ,
    returnLocation: SDQ,
    billableDays: 3,
  },
  terms: mockTenant.contractTerms,
  customerSignature: SEED_SIGNATURE_CUSTOMER,
  representativeSignature: SEED_SIGNATURE_REPRESENTATIVE,
  representativeName: "Christian Aybar",
  signature: {
    signedAt: "2026-09-24T15:42:00.000Z",
    documentVersion: 1,
    verificationId: "8F4A27D1-9C3E-4B2A-8F5D-1C7E9D3A4B21",
    documentHash:
      "SHA-256: 2b5f3e7c9d1a4e8f3c2d1b6f9e3a7c8d44e1f9b2c9d7a8e3f1c9b4d6e7f2a1c3d",
  },
  notes: "Cliente frecuente. Entrega sin novedades.",
};

export const mockContracts: Contract[] = [
  // ================= SCENARIO A: AR-1058 — pending signature ===============
  priced({
    id: "con_1058",
    contractNumber: "AR-1058",
    token: "demo-ar-1058",
    customerId: "cus_juan",
    vehicleId: "veh_rav4",
    status: "SENT",
    pickupAt: "2026-10-02T14:00:00.000Z",
    returnAt: "2026-10-07T22:00:00.000Z",
    pickupLocation: SDQ,
    returnLocation: SDQ,
    billableDays: 5,
    dailyRate: 65,
    insuranceAmount: 50,
    depositAmount: 300,
    discountAmount: 0,
    additionalCharges: [],
    notes:
      "Cliente solicita entrega en el Aeropuerto Las Américas (SDQ). Vuelo AA1234 llega a las 09:30 AM.",
    createdAt: "2026-09-30T14:24:00.000Z",
    sentAt: "2026-09-30T15:10:00.000Z",
    events: [
      ev("CONTRACT_CREATED", "2026-09-30T14:24:00.000Z", "Christian", "Contrato creado en borrador."),
      ev("CONTRACT_SENT", "2026-09-30T15:10:00.000Z", "Christian", "Contrato enviado al cliente para su firma."),
    ],
    documents: [
      {
        id: "doc_1058_contract",
        name: "Contrato AR-1058.pdf",
        type: "Contrato",
        addedAt: "2026-09-30T14:24:00.000Z",
      },
    ],
  }),

  // ================= SCENARIO B: AR-1057 — returning, needs signature ======
  priced({
    id: "con_1057",
    contractNumber: "AR-1057",
    token: "demo-ar-1057",
    customerId: "cus_maria",
    vehicleId: "veh_tucson",
    status: "VIEWED",
    pickupAt: "2026-09-28T13:00:00.000Z",
    returnAt: "2026-10-02T18:00:00.000Z",
    pickupLocation: SDQ,
    returnLocation: "Oficina Santo Domingo",
    billableDays: 5,
    dailyRate: 70,
    insuranceAmount: 70,
    depositAmount: 350,
    discountAmount: 0,
    additionalCharges: [],
    notes: "Cliente frecuente. Datos ya confirmados en alquiler anterior.",
    createdAt: "2026-09-27T10:00:00.000Z",
    sentAt: "2026-09-27T10:30:00.000Z",
    viewedAt: "2026-09-27T18:12:00.000Z",
    events: [
      ev("CONTRACT_CREATED", "2026-09-27T10:00:00.000Z", "Christian", "Contrato creado."),
      ev("CONTRACT_SENT", "2026-09-27T10:30:00.000Z", "Christian", "Contrato enviado por email."),
      ev("CONTRACT_VIEWED", "2026-09-27T18:12:00.000Z", "María López", "El cliente abrió el contrato."),
    ],
    documents: [],
  }),

  // ================= SCENARIO C: AR-1056 — already signed ==================
  (() => {
    const c = priced({
      id: "con_1056",
      contractNumber: "AR-1056",
      token: "demo-ar-1056",
      customerId: "cus_carlos",
      vehicleId: "veh_k5",
      status: "SIGNED",
      pickupAt: "2026-09-25T14:00:00.000Z",
      returnAt: "2026-09-28T14:00:00.000Z",
      pickupLocation: SDQ,
      returnLocation: SDQ,
      billableDays: 3,
      dailyRate: 60,
      insuranceAmount: 50,
      depositAmount: 250,
      discountAmount: 0,
      additionalCharges: [],
      notes: "Cliente frecuente. Entrega sin novedades.",
      createdAt: "2026-09-23T09:00:00.000Z",
      sentAt: "2026-09-23T09:30:00.000Z",
      viewedAt: "2026-09-24T15:20:00.000Z",
      signedAt: "2026-09-24T15:42:00.000Z",
      signature: SEED_SIGNATURE_CUSTOMER,
      signatureMetadata: signedSnapshot1056.signature,
      signedSnapshot: signedSnapshot1056,
      events: [
        ev("CONTRACT_CREATED", "2026-09-23T09:00:00.000Z", "Christian", "Contrato creado."),
        ev("CONTRACT_SENT", "2026-09-23T09:30:00.000Z", "Christian", "Contrato enviado."),
        ev("CONTRACT_VIEWED", "2026-09-24T15:20:00.000Z", "Carlos Díaz", "El cliente abrió el contrato."),
        ev("DOCUMENT_UPLOADED", "2026-09-24T15:35:00.000Z", "Carlos Díaz", "Licencia de conducir cargada."),
        ev("CONTRACT_SIGNED", "2026-09-24T15:42:00.000Z", "Carlos Díaz", "Contrato firmado digitalmente."),
      ],
      documents: [
        {
          id: "doc_1056_lic_front",
          name: "Licencia - Carlos Díaz (frontal).jpg",
          type: "Licencia",
          addedAt: "2026-09-24T15:35:00.000Z",
          image: carlos.licenseFrontImage,
        },
        {
          id: "doc_1056_lic_back",
          name: "Licencia - Carlos Díaz (posterior).jpg",
          type: "Licencia",
          addedAt: "2026-09-24T15:35:00.000Z",
          image: carlos.licenseBackImage,
        },
      ],
    });
    return c;
  })(),

  // ================= SCENARIO D: AR-1055 — delivered =======================
  priced({
    id: "con_1055",
    contractNumber: "AR-1055",
    token: "demo-ar-1055",
    customerId: "cus_andrea",
    vehicleId: "veh_corolla",
    status: "DELIVERED",
    pickupAt: "2026-09-20T13:00:00.000Z",
    returnAt: "2026-09-24T18:00:00.000Z",
    pickupLocation: SDQ,
    returnLocation: SDQ,
    billableDays: 4,
    dailyRate: 55,
    insuranceAmount: 60,
    depositAmount: 250,
    discountAmount: 0,
    additionalCharges: [],
    notes: "Entregado en aeropuerto. Vehículo con tanque lleno.",
    createdAt: "2026-09-18T09:00:00.000Z",
    sentAt: "2026-09-18T10:00:00.000Z",
    viewedAt: "2026-09-18T12:00:00.000Z",
    signedAt: "2026-09-19T09:15:00.000Z",
    signature: SEED_SIGNATURE_CUSTOMER,
    signatureMetadata: {
      signedAt: "2026-09-19T09:15:00.000Z",
      documentVersion: 1,
      verificationId: "11AA22BB-33CC-44DD-55EE-66FF77001122",
      documentHash:
        "SHA-256: aa11bb22cc33dd44ee55ff6600112233445566778899aabbccddeeff00112233",
    },
    events: [
      ev("CONTRACT_CREATED", "2026-09-18T09:00:00.000Z", "Christian", "Contrato creado."),
      ev("CONTRACT_SENT", "2026-09-18T10:00:00.000Z", "Christian", "Contrato enviado."),
      ev("CONTRACT_VIEWED", "2026-09-18T12:00:00.000Z", "Andrea Rodríguez", "El cliente abrió el contrato."),
      ev("CONTRACT_SIGNED", "2026-09-19T09:15:00.000Z", "Andrea Rodríguez", "Contrato firmado."),
      ev("CONTRACT_DELIVERED", "2026-09-20T13:05:00.000Z", "Christian", "Vehículo entregado al cliente."),
    ],
    documents: [],
  }),

  // ---- Extra contracts to fill the list and the filter counters ----------
  priced({
    id: "con_1054",
    contractNumber: "AR-1054",
    token: "demo-ar-1054",
    customerId: "cus_luis",
    vehicleId: "veh_tahoe",
    status: "DELIVERED",
    pickupAt: "2026-09-18T13:00:00.000Z",
    returnAt: "2026-09-24T18:00:00.000Z",
    pickupLocation: SDQ,
    returnLocation: SDQ,
    billableDays: 5,
    dailyRate: 130,
    insuranceAmount: 0,
    depositAmount: 500,
    discountAmount: 0,
    additionalCharges: [],
    createdAt: "2026-09-16T09:00:00.000Z",
    sentAt: "2026-09-16T09:30:00.000Z",
    signedAt: "2026-09-17T10:00:00.000Z",
    events: [
      ev("CONTRACT_CREATED", "2026-09-16T09:00:00.000Z", "Christian", "Contrato creado."),
      ev("CONTRACT_SIGNED", "2026-09-17T10:00:00.000Z", "Luis Santana", "Contrato firmado."),
      ev("CONTRACT_DELIVERED", "2026-09-18T13:00:00.000Z", "Christian", "Vehículo entregado."),
    ],
    documents: [],
  }),
  priced({
    id: "con_1053",
    contractNumber: "AR-1053",
    token: "demo-ar-1053",
    customerId: "cus_mariela",
    vehicleId: "veh_kicks",
    status: "CLOSED",
    pickupAt: "2026-09-10T13:00:00.000Z",
    returnAt: "2026-09-15T18:00:00.000Z",
    pickupLocation: "Oficina Santo Domingo",
    returnLocation: "Oficina Santo Domingo",
    billableDays: 5,
    dailyRate: 50,
    insuranceAmount: 50,
    depositAmount: 200,
    discountAmount: 0,
    additionalCharges: [],
    createdAt: "2026-09-08T09:00:00.000Z",
    signedAt: "2026-09-09T10:00:00.000Z",
    events: [
      ev("CONTRACT_CREATED", "2026-09-08T09:00:00.000Z", "Christian", "Contrato creado."),
      ev("CONTRACT_SIGNED", "2026-09-09T10:00:00.000Z", "Mariela Gómez", "Contrato firmado."),
      ev("CONTRACT_DELIVERED", "2026-09-10T13:00:00.000Z", "Christian", "Vehículo entregado."),
      ev("CONTRACT_RETURNED", "2026-09-15T18:00:00.000Z", "Christian", "Vehículo devuelto."),
      ev("CONTRACT_CLOSED", "2026-09-15T18:30:00.000Z", "Christian", "Contrato cerrado."),
    ],
    documents: [],
  }),
  priced({
    id: "con_1052",
    contractNumber: "AR-1052",
    token: "demo-ar-1052",
    customerId: "cus_roberto",
    vehicleId: "veh_accent",
    status: "DRAFT",
    pickupAt: "2026-10-05T13:00:00.000Z",
    returnAt: "2026-10-08T18:00:00.000Z",
    pickupLocation: "Oficina Santo Domingo",
    returnLocation: "Oficina Santo Domingo",
    billableDays: 3,
    dailyRate: 45,
    insuranceAmount: 40,
    depositAmount: 150,
    discountAmount: 0,
    additionalCharges: [],
    createdAt: "2026-10-01T09:00:00.000Z",
    events: [
      ev("CONTRACT_CREATED", "2026-10-01T09:00:00.000Z", "Christian", "Contrato creado en borrador."),
    ],
    documents: [],
  }),
];
