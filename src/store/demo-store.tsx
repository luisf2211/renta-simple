"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  Contract,
  ContractEvent,
  ContractEventType,
  Customer,
  Tenant,
  Vehicle,
} from "@/types";
import {
  buildSeedData,
  DEMO_STORAGE_KEY,
  type DemoData,
} from "./demo-data";
import { readJSON, writeJSON, removeKey } from "@/lib/storage/local-storage";
import { createMockContractRepository } from "@/repositories/contracts/mock-contract.repository";
import { createMockVehicleRepository } from "@/repositories/vehicles/mock-vehicle.repository";
import { createMockCustomerRepository } from "@/repositories/customers/mock-customer.repository";
import { createSupabaseContractRepository } from "@/repositories/contracts/supabase-contract.repository";
import { createSupabaseVehicleRepository } from "@/repositories/vehicles/supabase-vehicle.repository";
import { createSupabaseCustomerRepository } from "@/repositories/customers/supabase-customer.repository";
import { supabaseOps } from "@/repositories/supabase-ops";
import type { ContractRepository } from "@/repositories/contracts/contract.repository";
import type { VehicleRepository } from "@/repositories/vehicles/vehicle.repository";
import type { CustomerRepository } from "@/repositories/customers/customer.repository";
import { createSupabaseAmenityRepository } from "@/repositories/amenities/supabase-amenity.repository";
import type { AmenityRepository } from "@/repositories/amenities/amenity.repository";
import { createSupabaseLocationRepository } from "@/repositories/locations/supabase-location.repository";
import type { LocationRepository } from "@/repositories/locations/location.repository";
import { generateId } from "@/lib/signature/verification";
import { IS_SUPABASE, type DataSource } from "@/lib/config";
import { api } from "@/repositories/api-client";
import type { Amenity, Location } from "@/types";

export interface SignResult {
  contract: Contract;
}

interface DemoStoreValue {
  ready: boolean;
  dataSource: DataSource;
  tenant: Tenant;
  vehicles: Vehicle[];
  customers: Customer[];
  contracts: Contract[];
  amenities: Amenity[];
  locations: Location[];

  contractRepository: ContractRepository;
  vehicleRepository: VehicleRepository;
  customerRepository: CustomerRepository;
  amenityRepository: AmenityRepository | null;
  locationRepository: LocationRepository | null;

  getCustomer(id: string): Customer | undefined;
  getVehicle(id: string): Vehicle | undefined;
  getContract(id: string): Contract | undefined;
  getContractByToken(token: string): Contract | undefined;

  appendEvent(
    contractId: string,
    type: ContractEventType,
    actor: string,
    description: string,
  ): void;
  patchContract(id: string, patch: Partial<Contract>): void;
  patchCustomer(id: string, patch: Partial<Customer>): void;
  patchVehicle(id: string, patch: Partial<Vehicle>): void;
  addContract(contract: Contract): void;
  addCustomer(customer: Customer): void;

  nextContractNumber(): string;

  /** Re-fetch everything from the backend (Supabase mode) or reload seed. */
  refresh(): Promise<void>;
  /** Re-fetch a single contract (by id) and merge into state. */
  refreshContract(id: string): Promise<Contract | null>;

  /** Sign a contract by its public token. Persists in Supabase mode. */
  signContract(token: string, signatureDataUrl: string): Promise<Contract | null>;
  /** Upload a customer document photo (Supabase mode persists to Storage). */
  uploadCustomerDocument(input: {
    customerId: string;
    slot: "licenseFront" | "licenseBack" | "passport";
    dataUrl: string;
    fileName?: string;
  }): Promise<{ dataUrl: string } | null>;

  // Amenities catalogue
  refreshAmenities(): Promise<void>;
  createAmenity(input: Partial<Amenity>): Promise<Amenity | null>;
  updateAmenity(id: string, patch: Partial<Amenity>): Promise<void>;
  deleteAmenity(id: string): Promise<void>;

  // Locations catalogue
  refreshLocations(): Promise<void>;
  createLocation(input: Partial<Location>): Promise<Location | null>;
  updateLocation(id: string, patch: Partial<Location>): Promise<void>;
  deleteLocation(id: string): Promise<void>;

  // Vehicle photos + amenity selection (Supabase persists; refreshes vehicle)
  setVehicleAmenities(vehicleId: string, amenityIds: string[]): Promise<void>;
  uploadVehiclePhoto(input: {
    vehicleId: string;
    dataUrl: string;
    fileName?: string;
    isPrimary?: boolean;
  }): Promise<void>;
  deleteVehiclePhoto(vehicleId: string, photoId: string): Promise<void>;
  setPrimaryVehiclePhoto(vehicleId: string, photoId: string): Promise<void>;

  // Tenant config
  updateTenant(patch: Partial<Tenant>): Promise<void>;
  uploadTenantLogo(input: { dataUrl: string; fileName?: string }): Promise<void>;

  resetDemo(): void;
  loadScenario(scenario: "A" | "B" | "C"): string;
}

const DemoStoreContext = createContext<DemoStoreValue | null>(null);

const EMPTY_DATA: DemoData = {
  tenant: buildSeedData().tenant,
  vehicles: [],
  customers: [],
  contracts: [],
};

const SLOT_TO_DOCTYPE = {
  licenseFront: "DRIVER_LICENSE_FRONT",
  licenseBack: "DRIVER_LICENSE_BACK",
  passport: "PASSPORT",
} as const;

export function DemoStoreProvider({ children }: { children: React.ReactNode }) {
  // In Supabase mode we start empty and load from the API; in mock mode we
  // start from the local seed and hydrate from localStorage.
  const [data, setData] = useState<DemoData>(() =>
    IS_SUPABASE ? EMPTY_DATA : buildSeedData(),
  );
  const [ready, setReady] = useState(false);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const dataRef = useRef(data);
  dataRef.current = data;

  const amenityRepository = useMemo<AmenityRepository | null>(
    () => (IS_SUPABASE ? createSupabaseAmenityRepository() : null),
    [],
  );
  const locationRepository = useMemo<LocationRepository | null>(
    () => (IS_SUPABASE ? createSupabaseLocationRepository() : null),
    [],
  );

  const loadFromSupabase = useCallback(async () => {
    const [tenant, customers, vehicles, contracts, amenityList, locationList] =
      await Promise.all([
        api.get<Tenant>("/tenant"),
        api.get<Customer[]>("/customers"),
        api.get<Vehicle[]>("/vehicles"),
        api.get<Contract[]>("/contracts"),
        api.get<Amenity[]>("/amenities"),
        api.get<Location[]>("/locations"),
      ]);
    setData({ tenant, customers, vehicles, contracts });
    setAmenities(amenityList);
    setLocations(locationList);
  }, []);

  // Initial load.
  useEffect(() => {
    let active = true;
    (async () => {
      if (IS_SUPABASE) {
        try {
          await loadFromSupabase();
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error("[store] Error cargando datos de Supabase:", e);
        }
        if (active) setReady(true);
      } else {
        const stored = readJSON<DemoData>(DEMO_STORAGE_KEY);
        if (stored && stored.contracts && stored.customers && stored.vehicles) {
          setData(stored);
        }
        setReady(true);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to localStorage only in mock mode.
  useEffect(() => {
    if (!ready || IS_SUPABASE) return;
    writeJSON(DEMO_STORAGE_KEY, data);
  }, [data, ready]);

  const getData = useCallback(() => dataRef.current, []);

  const setContracts = useCallback(
    (updater: (prev: Contract[]) => Contract[]) =>
      setData((prev) => ({ ...prev, contracts: updater(prev.contracts) })),
    [],
  );
  const setCustomers = useCallback(
    (updater: (prev: Customer[]) => Customer[]) =>
      setData((prev) => ({ ...prev, customers: updater(prev.customers) })),
    [],
  );
  const setVehicles = useCallback(
    (updater: (prev: Vehicle[]) => Vehicle[]) =>
      setData((prev) => ({ ...prev, vehicles: updater(prev.vehicles) })),
    [],
  );

  // Repositories: mock closures over local state, or Supabase API-backed.
  const contractRepository = useMemo<ContractRepository>(
    () =>
      IS_SUPABASE
        ? createSupabaseContractRepository()
        : createMockContractRepository(getData, setContracts),
    [getData, setContracts],
  );
  const vehicleRepository = useMemo<VehicleRepository>(
    () =>
      IS_SUPABASE
        ? createSupabaseVehicleRepository()
        : createMockVehicleRepository(getData, setVehicles),
    [getData, setVehicles],
  );
  const customerRepository = useMemo<CustomerRepository>(
    () =>
      IS_SUPABASE
        ? createSupabaseCustomerRepository()
        : createMockCustomerRepository(getData, setCustomers),
    [getData, setCustomers],
  );

  const getCustomer = useCallback(
    (id: string) => dataRef.current.customers.find((c) => c.id === id),
    [],
  );
  const getVehicle = useCallback(
    (id: string) => dataRef.current.vehicles.find((v) => v.id === id),
    [],
  );
  const getContract = useCallback(
    (id: string) => dataRef.current.contracts.find((c) => c.id === id),
    [],
  );
  const getContractByToken = useCallback(
    (token: string) => dataRef.current.contracts.find((c) => c.token === token),
    [],
  );

  const mergeContract = useCallback(
    (next: Contract) =>
      setContracts((prev) => {
        const exists = prev.some((c) => c.id === next.id);
        return exists ? prev.map((c) => (c.id === next.id ? next : c)) : [next, ...prev];
      }),
    [setContracts],
  );

  // --- Mutations: optimistic local update + background persist in Supabase ---

  const patchContract = useCallback(
    (id: string, patch: Partial<Contract>) => {
      setContracts((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
      if (IS_SUPABASE) {
        void contractRepository.update(id, patch).catch((e) => {
          // eslint-disable-next-line no-console
          console.error("[store] update contract falló:", e);
        });
      }
    },
    [setContracts, contractRepository],
  );
  const patchCustomer = useCallback(
    (id: string, patch: Partial<Customer>) => {
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
      if (IS_SUPABASE) {
        void customerRepository.update(id, patch).catch((e) => {
          // eslint-disable-next-line no-console
          console.error("[store] update customer falló:", e);
        });
      }
    },
    [setCustomers, customerRepository],
  );
  const patchVehicle = useCallback(
    (id: string, patch: Partial<Vehicle>) => {
      setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
      if (IS_SUPABASE) {
        void vehicleRepository.update(id, patch).catch((e) => {
          // eslint-disable-next-line no-console
          console.error("[store] update vehicle falló:", e);
        });
      }
    },
    [setVehicles, vehicleRepository],
  );

  const appendEvent = useCallback(
    (contractId: string, type: ContractEventType, actor: string, description: string) => {
      const event: ContractEvent = {
        id: generateId("evt"),
        type,
        at: new Date().toISOString(),
        actor,
        description,
      };
      setContracts((prev) =>
        prev.map((c) =>
          c.id === contractId ? { ...c, events: [...c.events, event] } : c,
        ),
      );
      if (IS_SUPABASE) {
        void supabaseOps
          .appendEvent({ contractId, type, actor, description })
          .catch((e) => {
            // eslint-disable-next-line no-console
            console.error("[store] appendEvent falló:", e);
          });
      }
    },
    [setContracts],
  );

  const addContract = useCallback(
    (contract: Contract) => {
      setContracts((prev) => [contract, ...prev]);
      if (IS_SUPABASE) {
        void contractRepository
          .create(contract)
          .then((created) => mergeContract(created))
          .catch((e) => {
            // eslint-disable-next-line no-console
            console.error("[store] create contract falló:", e);
          });
      }
    },
    [setContracts, contractRepository, mergeContract],
  );
  const addCustomer = useCallback(
    (customer: Customer) => {
      setCustomers((prev) => [customer, ...prev]);
      if (IS_SUPABASE) {
        void customerRepository
          .create(customer)
          .then((created) =>
            setCustomers((prev) =>
              prev.map((c) => (c.id === customer.id ? created : c)),
            ),
          )
          .catch((e) => {
            // eslint-disable-next-line no-console
            console.error("[store] create customer falló:", e);
          });
      }
    },
    [setCustomers, customerRepository],
  );

  const nextContractNumber = useCallback(() => {
    const prefix = dataRef.current.tenant.contractPrefix;
    const numbers = dataRef.current.contracts
      .map((c) => Number(c.contractNumber.replace(`${prefix}-`, "")))
      .filter((n) => Number.isFinite(n));
    const max = numbers.length ? Math.max(...numbers) : 1000;
    return `${prefix}-${max + 1}`;
  }, []);

  const refresh = useCallback(async () => {
    if (IS_SUPABASE) {
      await loadFromSupabase();
    } else {
      setData(buildSeedData());
    }
  }, [loadFromSupabase]);

  const refreshContract = useCallback(
    async (id: string) => {
      const fresh = await contractRepository.getById(id);
      if (fresh) mergeContract(fresh);
      return fresh;
    },
    [contractRepository, mergeContract],
  );

  const signContract = useCallback(
    async (token: string, signatureDataUrl: string): Promise<Contract | null> => {
      if (IS_SUPABASE) {
        const signed = await supabaseOps.signByToken({
          token,
          signatureDataUrl,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        });
        mergeContract(signed);
        return signed;
      }
      // Mock mode: caller (CustomerContractFlow) handles the local snapshot.
      return null;
    },
    [mergeContract],
  );

  const uploadCustomerDocument = useCallback(
    async (input: {
      customerId: string;
      slot: "licenseFront" | "licenseBack" | "passport";
      dataUrl: string;
      fileName?: string;
    }) => {
      if (!IS_SUPABASE) return null;
      const res = await supabaseOps.uploadCustomerDocument({
        customerId: input.customerId,
        documentType: SLOT_TO_DOCTYPE[input.slot],
        dataUrl: input.dataUrl,
        fileName: input.fileName,
      });
      return res;
    },
    [],
  );

  // ---- Amenities ----
  const refreshAmenities = useCallback(async () => {
    if (!amenityRepository) return;
    setAmenities(await amenityRepository.list());
  }, [amenityRepository]);

  const createAmenity = useCallback(
    async (input: Partial<Amenity>) => {
      if (!amenityRepository) return null;
      const created = await amenityRepository.create(input);
      setAmenities((prev) => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder));
      return created;
    },
    [amenityRepository],
  );
  const updateAmenityFn = useCallback(
    async (id: string, patch: Partial<Amenity>) => {
      setAmenities((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
      if (amenityRepository) await amenityRepository.update(id, patch);
    },
    [amenityRepository],
  );
  const deleteAmenityFn = useCallback(
    async (id: string) => {
      setAmenities((prev) => prev.filter((a) => a.id !== id));
      if (amenityRepository) await amenityRepository.remove(id);
    },
    [amenityRepository],
  );

  // ---- Locations ----
  const refreshLocations = useCallback(async () => {
    if (!locationRepository) return;
    setLocations(await locationRepository.list());
  }, [locationRepository]);

  const createLocationFn = useCallback(
    async (input: Partial<Location>) => {
      if (!locationRepository) return null;
      const created = await locationRepository.create(input);
      setLocations((prev) => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder));
      return created;
    },
    [locationRepository],
  );
  const updateLocationFn = useCallback(
    async (id: string, patch: Partial<Location>) => {
      setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
      if (locationRepository) await locationRepository.update(id, patch);
    },
    [locationRepository],
  );
  const deleteLocationFn = useCallback(
    async (id: string) => {
      setLocations((prev) => prev.filter((l) => l.id !== id));
      if (locationRepository) await locationRepository.remove(id);
    },
    [locationRepository],
  );

  // ---- Vehicle photos + amenity selection ----
  const refreshVehicle = useCallback(
    async (id: string) => {
      const fresh = await vehicleRepository.getById(id);
      if (fresh) setVehicles((prev) => prev.map((v) => (v.id === id ? fresh : v)));
    },
    [vehicleRepository, setVehicles],
  );

  const setVehicleAmenitiesFn = useCallback(
    async (vehicleId: string, amenityIds: string[]) => {
      // Optimistic local update of amenityIds + resolved amenities.
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === vehicleId
            ? {
                ...v,
                amenityIds,
                amenities: amenities.filter((a) => amenityIds.includes(a.id)),
              }
            : v,
        ),
      );
      if (IS_SUPABASE) {
        await supabaseOps.setVehicleAmenities(vehicleId, amenityIds);
      }
    },
    [setVehicles, amenities],
  );

  const uploadVehiclePhotoFn = useCallback(
    async (input: {
      vehicleId: string;
      dataUrl: string;
      fileName?: string;
      isPrimary?: boolean;
    }) => {
      if (IS_SUPABASE) {
        await supabaseOps.uploadVehiclePhoto(input);
        await refreshVehicle(input.vehicleId);
      } else {
        // Mock: append a local photo.
        const photo = {
          id: generateId("vph"),
          url: input.dataUrl,
          isPrimary: input.isPrimary ?? false,
          sortOrder: 0,
        };
        setVehicles((prev) =>
          prev.map((v) => {
            if (v.id !== input.vehicleId) return v;
            const photos = v.photos.length === 0 ? [{ ...photo, isPrimary: true }] : [...v.photos, photo];
            const primary = photos.find((p) => p.isPrimary) ?? photos[0];
            return { ...v, photos, image: primary?.url };
          }),
        );
      }
    },
    [refreshVehicle, setVehicles],
  );

  const deleteVehiclePhotoFn = useCallback(
    async (vehicleId: string, photoId: string) => {
      if (IS_SUPABASE) {
        await supabaseOps.deleteVehiclePhoto(vehicleId, photoId);
        await refreshVehicle(vehicleId);
      } else {
        setVehicles((prev) =>
          prev.map((v) => {
            if (v.id !== vehicleId) return v;
            const photos = v.photos.filter((p) => p.id !== photoId);
            if (photos.length && !photos.some((p) => p.isPrimary) && photos[0]) {
              photos[0].isPrimary = true;
            }
            const primary = photos.find((p) => p.isPrimary) ?? photos[0];
            return { ...v, photos, image: primary?.url };
          }),
        );
      }
    },
    [refreshVehicle, setVehicles],
  );

  const setPrimaryVehiclePhotoFn = useCallback(
    async (vehicleId: string, photoId: string) => {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.id !== vehicleId) return v;
          const photos = v.photos.map((p) => ({ ...p, isPrimary: p.id === photoId }));
          const primary = photos.find((p) => p.isPrimary) ?? photos[0];
          return { ...v, photos, image: primary?.url };
        }),
      );
      if (IS_SUPABASE) {
        await supabaseOps.setPrimaryVehiclePhoto(vehicleId, photoId);
      }
    },
    [setVehicles],
  );

  // ---- Tenant config ----
  const updateTenantFn = useCallback(async (patch: Partial<Tenant>) => {
    setData((prev) => ({ ...prev, tenant: { ...prev.tenant, ...patch } }));
    if (IS_SUPABASE) {
      const updated = await supabaseOps.updateTenant(patch);
      setData((prev) => ({ ...prev, tenant: updated }));
    }
  }, []);

  const uploadTenantLogoFn = useCallback(async (input: { dataUrl: string; fileName?: string }) => {
    if (IS_SUPABASE) {
      const updated = await supabaseOps.uploadTenantLogo(input);
      setData((prev) => ({ ...prev, tenant: updated }));
    } else {
      setData((prev) => ({ ...prev, tenant: { ...prev.tenant, logoUrl: input.dataUrl } }));
    }
  }, []);

  const resetDemo = useCallback(() => {
    if (IS_SUPABASE) {
      void refresh();
      return;
    }
    removeKey(DEMO_STORAGE_KEY);
    setData(buildSeedData());
  }, [refresh]);

  const loadScenario = useCallback(
    (scenario: "A" | "B" | "C") => {
      if (!IS_SUPABASE) setData(buildSeedData());
      return scenario === "A"
        ? "demo-ar-1058"
        : scenario === "B"
          ? "demo-ar-1057"
          : "demo-ar-1056";
    },
    [],
  );

  const value: DemoStoreValue = {
    ready,
    dataSource: IS_SUPABASE ? "supabase" : "mock",
    tenant: data.tenant,
    vehicles: data.vehicles,
    customers: data.customers,
    contracts: data.contracts,
    amenities,
    locations,
    contractRepository,
    vehicleRepository,
    customerRepository,
    amenityRepository,
    locationRepository,
    getCustomer,
    getVehicle,
    getContract,
    getContractByToken,
    appendEvent,
    patchContract,
    patchCustomer,
    patchVehicle,
    addContract,
    addCustomer,
    nextContractNumber,
    refresh,
    refreshContract,
    signContract,
    uploadCustomerDocument,
    refreshAmenities,
    createAmenity,
    updateAmenity: updateAmenityFn,
    deleteAmenity: deleteAmenityFn,
    refreshLocations,
    createLocation: createLocationFn,
    updateLocation: updateLocationFn,
    deleteLocation: deleteLocationFn,
    setVehicleAmenities: setVehicleAmenitiesFn,
    uploadVehiclePhoto: uploadVehiclePhotoFn,
    deleteVehiclePhoto: deleteVehiclePhotoFn,
    setPrimaryVehiclePhoto: setPrimaryVehiclePhotoFn,
    updateTenant: updateTenantFn,
    uploadTenantLogo: uploadTenantLogoFn,
    resetDemo,
    loadScenario,
  };

  return (
    <DemoStoreContext.Provider value={value}>{children}</DemoStoreContext.Provider>
  );
}

export function useDemoStore(): DemoStoreValue {
  const ctx = useContext(DemoStoreContext);
  if (!ctx) {
    throw new Error("useDemoStore debe usarse dentro de <DemoStoreProvider>");
  }
  return ctx;
}
