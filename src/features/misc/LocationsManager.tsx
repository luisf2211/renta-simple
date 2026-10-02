"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Input,
  Select,
  Switch,
  IconButton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useDemoStore } from "@/store/demo-store";
import { AmenityIcon } from "@/components/ui/AmenityIcon";
import { FormField } from "@/components/ui/FormField";
import {
  type Location,
  type LocationType,
  LOCATION_TYPE_LABELS,
  LOCATION_TYPE_ICONS,
} from "@/types";

const TYPES: LocationType[] = ["AIRPORT", "OFFICE", "HOTEL", "OTHER"];

export function LocationsManager() {
  const { locations, refreshLocations, createLocation, updateLocation, deleteLocation } =
    useDemoStore();
  const toast = useToast();
  const editor = useDisclosure();
  const [editing, setEditing] = useState<Location | null>(null);

  useEffect(() => {
    if (locations.length === 0) void refreshLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box>
      <Flex align="center" justify="space-between" mb="12px">
        <Text fontSize="13px" color="fg.muted">
          Lugares de entrega y devolución disponibles al crear un contrato.
        </Text>
        <Button
          size="sm"
          colorScheme="red"
          bg="brand.500"
          _hover={{ bg: "brand.600" }}
          leftIcon={<Plus size={14} />}
          onClick={() => {
            setEditing(null);
            editor.onOpen();
          }}
        >
          Nueva ubicación
        </Button>
      </Flex>

      {locations.length === 0 ? (
        <Text fontSize="13px" color="fg.subtle" py="20px" textAlign="center">
          Sin ubicaciones. Crea la primera.
        </Text>
      ) : (
        <Flex direction="column" border="1px solid" borderColor="canvas.border" borderRadius="8px" overflow="hidden">
          {locations.map((l) => (
            <Flex
              key={l.id}
              align="center"
              gap="10px"
              px="12px"
              py="10px"
              borderBottom="1px solid"
              borderColor="canvas.borderMuted"
              _last={{ borderBottom: "none" }}
              opacity={l.isActive ? 1 : 0.5}
            >
              <Box color="fg.muted">
                <AmenityIcon name={LOCATION_TYPE_ICONS[l.type]} size={16} />
              </Box>
              <Box flex="1" minW={0}>
                <Text fontSize="13px" fontWeight="600">
                  {l.name}
                </Text>
                <Text fontSize="12px" color="fg.muted">
                  {LOCATION_TYPE_LABELS[l.type]}
                  {l.address ? ` · ${l.address}` : ""}
                </Text>
              </Box>
              <Switch
                size="sm"
                colorScheme="green"
                isChecked={l.isActive}
                onChange={(e) => void updateLocation(l.id, { isActive: e.target.checked })}
              />
              <IconButton
                aria-label="Editar"
                icon={<Pencil size={14} />}
                size="xs"
                variant="ghost"
                onClick={() => {
                  setEditing(l);
                  editor.onOpen();
                }}
              />
              <IconButton
                aria-label="Eliminar"
                icon={<Trash2 size={14} />}
                size="xs"
                variant="ghost"
                color="brand.600"
                onClick={() => {
                  void deleteLocation(l.id);
                  toast({ title: "Ubicación eliminada.", status: "info", duration: 1600 });
                }}
              />
            </Flex>
          ))}
        </Flex>
      )}

      <LocationEditorModal
        isOpen={editor.isOpen}
        onClose={editor.onClose}
        location={editing}
        onSave={async (values) => {
          if (editing) {
            await updateLocation(editing.id, values);
            toast({ title: "Ubicación actualizada.", status: "success", duration: 1600 });
          } else {
            await createLocation(values);
            toast({ title: "Ubicación creada.", status: "success", duration: 1600 });
          }
          editor.onClose();
        }}
      />
    </Box>
  );
}

function LocationEditorModal({
  isOpen,
  onClose,
  location,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  location: Location | null;
  onSave: (values: Partial<Location>) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState<LocationType>("OFFICE");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(location?.name ?? "");
      setAddress(location?.address ?? "");
      setType(location?.type ?? "OFFICE");
    }
  }, [isOpen, location]);

  const save = async () => {
    if (name.trim().length < 2) return;
    setSaving(true);
    try {
      await onSave({ name: name.trim(), address: address.trim(), type });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px">
          {location ? "Editar ubicación" : "Nueva ubicación"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column" gap="14px">
            <FormField label="Nombre" required>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Aeropuerto Las Américas (SDQ)" />
            </FormField>
            <FormField label="Dirección" hint="Opcional. Se muestra como referencia.">
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Santo Domingo, R.D." />
            </FormField>
            <FormField label="Tipo">
              <Select value={type} onChange={(e) => setType(e.target.value as LocationType)}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {LOCATION_TYPE_LABELS[t]}
                  </option>
                ))}
              </Select>
            </FormField>
          </Flex>
        </ModalBody>
        <ModalFooter gap="8px">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button colorScheme="red" bg="brand.500" _hover={{ bg: "brand.600" }} onClick={save} isLoading={saving}>
            Guardar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
