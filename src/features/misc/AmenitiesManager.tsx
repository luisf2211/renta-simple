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
  SimpleGrid,
  useDisclosure,
} from "@chakra-ui/react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useDemoStore } from "@/store/demo-store";
import { AmenityIcon } from "@/components/ui/AmenityIcon";
import { FormField } from "@/components/ui/FormField";
import {
  type Amenity,
  type AmenityCategory,
  AMENITY_CATEGORY_LABELS,
  AMENITY_CATEGORY_ORDER,
} from "@/types";

const ICON_SUGGESTIONS = [
  "Smartphone", "Bluetooth", "Usb", "Navigation", "Snowflake", "Armchair",
  "Sun", "KeyRound", "Gauge", "Camera", "Radar", "ShieldCheck", "Siren",
  "Cog", "Mountain", "Users", "Package", "Wifi", "Music", "Check",
];

export function AmenitiesManager() {
  const { amenities, refreshAmenities, createAmenity, updateAmenity, deleteAmenity } =
    useDemoStore();
  const toast = useToast();
  const editor = useDisclosure();
  const [editing, setEditing] = useState<Amenity | null>(null);

  useEffect(() => {
    if (amenities.length === 0) void refreshAmenities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grouped = AMENITY_CATEGORY_ORDER.map((cat) => ({
    cat,
    items: amenities.filter((a) => a.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <Box>
      <Flex align="center" justify="space-between" mb="12px">
        <Text fontSize="13px" color="fg.muted">
          Catálogo de amenidades que puedes asignar a los vehículos.
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
          Nueva amenidad
        </Button>
      </Flex>

      {grouped.length === 0 ? (
        <Text fontSize="13px" color="fg.subtle" py="20px" textAlign="center">
          Sin amenidades. Crea la primera.
        </Text>
      ) : (
        <Flex direction="column" gap="18px">
          {grouped.map((g) => (
            <Box key={g.cat}>
              <Text
                fontSize="11px"
                fontWeight="700"
                color="fg.muted"
                textTransform="uppercase"
                letterSpacing="0.04em"
                mb="8px"
              >
                {AMENITY_CATEGORY_LABELS[g.cat]}
              </Text>
              <Flex direction="column" border="1px solid" borderColor="canvas.border" borderRadius="8px" overflow="hidden">
                {g.items.map((a) => (
                  <Flex
                    key={a.id}
                    align="center"
                    gap="10px"
                    px="12px"
                    py="9px"
                    borderBottom="1px solid"
                    borderColor="canvas.borderMuted"
                    _last={{ borderBottom: "none" }}
                    opacity={a.isActive ? 1 : 0.5}
                  >
                    <Box color="fg.muted">
                      <AmenityIcon name={a.icon} size={16} />
                    </Box>
                    <Text fontSize="13px" fontWeight="500" flex="1">
                      {a.name}
                    </Text>
                    <Switch
                      size="sm"
                      colorScheme="green"
                      isChecked={a.isActive}
                      onChange={(e) => {
                        void updateAmenity(a.id, { isActive: e.target.checked });
                      }}
                    />
                    <IconButton
                      aria-label="Editar"
                      icon={<Pencil size={14} />}
                      size="xs"
                      variant="ghost"
                      onClick={() => {
                        setEditing(a);
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
                        void deleteAmenity(a.id);
                        toast({ title: "Amenidad eliminada.", status: "info", duration: 1600 });
                      }}
                    />
                  </Flex>
                ))}
              </Flex>
            </Box>
          ))}
        </Flex>
      )}

      <AmenityEditorModal
        isOpen={editor.isOpen}
        onClose={editor.onClose}
        amenity={editing}
        onSave={async (values) => {
          if (editing) {
            await updateAmenity(editing.id, values);
            toast({ title: "Amenidad actualizada.", status: "success", duration: 1600 });
          } else {
            await createAmenity(values);
            toast({ title: "Amenidad creada.", status: "success", duration: 1600 });
          }
          editor.onClose();
        }}
      />
    </Box>
  );
}

function AmenityEditorModal({
  isOpen,
  onClose,
  amenity,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  amenity: Amenity | null;
  onSave: (values: Partial<Amenity>) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Check");
  const [category, setCategory] = useState<AmenityCategory>("OTHER");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(amenity?.name ?? "");
      setIcon(amenity?.icon ?? "Check");
      setCategory(amenity?.category ?? "CONNECTIVITY");
    }
  }, [isOpen, amenity]);

  const save = async () => {
    if (name.trim().length < 2) return;
    setSaving(true);
    try {
      await onSave({ name: name.trim(), icon, category });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="16px">{amenity ? "Editar amenidad" : "Nueva amenidad"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column" gap="14px">
            <FormField label="Nombre" required>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Apple CarPlay" />
            </FormField>
            <FormField label="Categoría">
              <Select value={category} onChange={(e) => setCategory(e.target.value as AmenityCategory)}>
                {AMENITY_CATEGORY_ORDER.map((c) => (
                  <option key={c} value={c}>
                    {AMENITY_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Ícono" hint="Nombre de ícono (Lucide). Toca uno para elegirlo.">
              <Input value={icon} onChange={(e) => setIcon(e.target.value)} />
            </FormField>
            <SimpleGrid columns={8} spacing="6px">
              {ICON_SUGGESTIONS.map((ic) => (
                <IconButton
                  key={ic}
                  aria-label={ic}
                  icon={<AmenityIcon name={ic} size={16} />}
                  size="sm"
                  variant={icon === ic ? "solid" : "outline"}
                  colorScheme={icon === ic ? "red" : "gray"}
                  bg={icon === ic ? "brand.500" : undefined}
                  onClick={() => setIcon(ic)}
                />
              ))}
            </SimpleGrid>
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
