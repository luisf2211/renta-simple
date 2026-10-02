"use client";

import { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Image,
  IconButton,
  Badge,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { Star, Trash2 } from "lucide-react";
import type { Vehicle } from "@/types";
import { useDemoStore } from "@/store/demo-store";
import { ImageUpload } from "@/components/ui/ImageUpload";

/**
 * Manage a vehicle's photos: the primary (thumbnail) is marked with a star;
 * extras can be added, promoted to primary, or removed. Each action persists
 * immediately (Supabase mode) and refreshes the vehicle.
 */
export function VehiclePhotosManager({ vehicle }: { vehicle: Vehicle }) {
  const { uploadVehiclePhoto, deleteVehiclePhoto, setPrimaryVehiclePhoto } = useDemoStore();
  const toast = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);

  return (
    <Box>
      <Flex align="center" justify="space-between" mb="8px">
        <Text fontSize="12px" fontWeight="600">
          Fotos del vehículo
        </Text>
        <Text fontSize="11px" color="fg.subtle">
          La principal se usa como miniatura.
        </Text>
      </Flex>

      {vehicle.photos.length > 0 && (
        <Flex gap="8px" wrap="wrap" mb="12px">
          {vehicle.photos.map((p) => (
            <Box
              key={p.id}
              position="relative"
              w="104px"
              h="72px"
              borderRadius="6px"
              overflow="hidden"
              border="1px solid"
              borderColor={p.isPrimary ? "brand.500" : "canvas.border"}
            >
              <Image src={p.url} alt="" w="100%" h="100%" objectFit="cover" />
              {p.isPrimary && (
                <Badge
                  position="absolute"
                  top="3px"
                  left="3px"
                  colorScheme="red"
                  bg="brand.500"
                  color="white"
                  fontSize="8px"
                >
                  Principal
                </Badge>
              )}
              <Flex position="absolute" bottom="0" left="0" right="0" bg="rgba(255,255,255,0.92)" justify="center" gap="2px" py="1px">
                {busyId === p.id ? (
                  <Spinner size="xs" />
                ) : (
                  <>
                    {!p.isPrimary && (
                      <IconButton
                        aria-label="Hacer principal"
                        icon={<Star size={12} />}
                        size="xs"
                        variant="ghost"
                        onClick={async () => {
                          setBusyId(p.id);
                          await setPrimaryVehiclePhoto(vehicle.id, p.id);
                          setBusyId(null);
                        }}
                      />
                    )}
                    <IconButton
                      aria-label="Eliminar foto"
                      icon={<Trash2 size={12} />}
                      size="xs"
                      variant="ghost"
                      color="brand.600"
                      onClick={async () => {
                        setBusyId(p.id);
                        await deleteVehiclePhoto(vehicle.id, p.id);
                        setBusyId(null);
                      }}
                    />
                  </>
                )}
              </Flex>
            </Box>
          ))}
        </Flex>
      )}

      <Box maxW="260px">
        <ImageUpload
          label=""
          onSelect={async (dataUrl, fileName) => {
            await uploadVehiclePhoto({ vehicleId: vehicle.id, dataUrl, fileName });
            toast({ title: "Foto agregada.", status: "success", duration: 1600 });
          }}
          aspect="16/10"
          compact
        />
      </Box>
    </Box>
  );
}
