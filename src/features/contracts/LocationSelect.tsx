"use client";

import { Input, Select, Flex } from "@chakra-ui/react";
import { useDemoStore } from "@/store/demo-store";

const CUSTOM = "__custom__";

/**
 * Pickup/return location picker. Lists the active location catalogue; the
 * contract still stores the chosen location as text (name). Choosing "Otra…"
 * reveals a free-text field so unusual places aren't blocked.
 */
export function LocationSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { locations, dataSource } = useDemoStore();
  const active = locations.filter((l) => l.isActive);

  // Mock mode (no catalogue): fall back to a plain text input.
  if (dataSource !== "supabase" || active.length === 0) {
    return (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Aeropuerto, oficina..."
      />
    );
  }

  const matchesCatalogue = active.some((l) => l.name === value);
  const isCustom = value !== "" && !matchesCatalogue;
  const selectValue = value === "" ? "" : matchesCatalogue ? value : CUSTOM;

  return (
    <Flex direction="column" gap="6px">
      <Select
        value={selectValue}
        onChange={(e) => {
          const v = e.target.value;
          if (v === CUSTOM) {
            onChange(" "); // trigger custom input (non-empty, non-catalogue)
          } else {
            onChange(v);
          }
        }}
        placeholder="Selecciona una ubicación"
      >
        {active.map((l) => (
          <option key={l.id} value={l.name}>
            {l.name}
          </option>
        ))}
        <option value={CUSTOM}>Otra ubicación…</option>
      </Select>

      {isCustom && (
        <Input
          autoFocus
          value={value.trim() === "" ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Escribe la ubicación"
        />
      )}
    </Flex>
  );
}
