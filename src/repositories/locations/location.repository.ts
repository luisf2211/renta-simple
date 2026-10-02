import type { Location } from "@/types";

export interface LocationRepository {
  list(): Promise<Location[]>;
  create(location: Partial<Location>): Promise<Location>;
  update(id: string, patch: Partial<Location>): Promise<Location>;
  remove(id: string): Promise<void>;
}
