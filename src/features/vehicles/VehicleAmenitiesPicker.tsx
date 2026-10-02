"use client";

import { Box, Flex, Text, Checkbox, SimpleGrid } from "@chakra-ui/react";
import { AmenityIcon } from "@/components/ui/AmenityIcon";
import { useDemoStore } from "@/store/demo-store";
import { AMENITY_CATEGORY_LABELS, AMENITY_CATEGORY_ORDER } from "@/types";

/**
 * Multi-select of amenities grouped by category. Selection is controlled by the
 * parent (editor), which persists it on save.
 */
export function VehicleAmenitiesPicker({
  selectedIds,
  onToggle,
}: {
  selectedIds: string[];
  onToggle: (amenityId: string, checked: boolean) => void;
}) {
  const { amenities } = useDemoStore();
  const active = amenities.filter((a) => a.isActive);

  if (active.length === 0) {
    return (
      <Text fontSize="12px" color="fg.subtle">
        No hay amenidades activas. Agrégalas en Configuración → Amenidades.
      </Text>
    );
  }

  const grouped = AMENITY_CATEGORY_ORDER.map((cat) => ({
    cat,
    items: active.filter((a) => a.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <Flex direction="column" gap="14px">
      {grouped.map((g) => (
        <Box key={g.cat}>
          <Text
            fontSize="11px"
            fontWeight="700"
            color="fg.muted"
            textTransform="uppercase"
            letterSpacing="0.04em"
            mb="6px"
          >
            {AMENITY_CATEGORY_LABELS[g.cat]}
          </Text>
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing="4px 12px">
            {g.items.map((a) => (
              <Checkbox
                key={a.id}
                size="sm"
                colorScheme="red"
                isChecked={selectedIds.includes(a.id)}
                onChange={(e) => onToggle(a.id, e.target.checked)}
              >
                <Flex align="center" gap="6px">
                  <Box color="fg.muted">
                    <AmenityIcon name={a.icon} size={14} />
                  </Box>
                  <Text fontSize="13px">{a.name}</Text>
                </Flex>
              </Checkbox>
            ))}
          </SimpleGrid>
        </Box>
      ))}
    </Flex>
  );
}
