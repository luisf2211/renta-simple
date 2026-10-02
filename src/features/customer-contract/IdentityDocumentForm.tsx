"use client";

import { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Input,
  Select,
  SimpleGrid,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useToast,
} from "@chakra-ui/react";
import type { StoredImage } from "@/types";
import { FormField } from "@/components/ui/FormField";
import { DocumentPhotoCapture } from "./DocumentPhotoCapture";
import { StepNav } from "./StepNav";

const COUNTRIES = [
  "República Dominicana",
  "Estados Unidos",
  "España",
  "México",
  "Colombia",
  "Otro",
];

export interface IdentityData {
  licenseFrontImage?: StoredImage;
  licenseBackImage?: StoredImage;
  passportImage?: StoredImage;
  licenseNumber: string;
  licenseCountry: string;
  licenseExpiration: string;
  passportNumber: string;
  passportCountry: string;
  passportExpiration: string;
  docType: "license" | "passport";
}

export function IdentityDocumentForm({
  initial,
  onBack,
  onSubmit,
}: {
  initial: IdentityData;
  onBack: () => void;
  onSubmit: (data: IdentityData) => void;
}) {
  const toast = useToast();
  const [data, setData] = useState<IdentityData>(initial);

  const update = (patch: Partial<IdentityData>) => setData((d) => ({ ...d, ...patch }));

  const licenseValid =
    !!data.licenseFrontImage &&
    !!data.licenseBackImage &&
    data.licenseNumber.trim().length > 0 &&
    data.licenseCountry.trim().length > 0 &&
    data.licenseExpiration.trim().length > 0;

  const passportValid =
    !!data.passportImage &&
    data.passportNumber.trim().length > 0 &&
    data.passportCountry.trim().length > 0 &&
    data.passportExpiration.trim().length > 0;

  const canContinue = data.docType === "license" ? licenseValid : passportValid;

  const handleNext = () => {
    if (!canContinue) {
      toast({
        title: "Completa las fotos y los datos del documento.",
        status: "warning",
        duration: 2400,
      });
      return;
    }
    onSubmit(data);
  };

  return (
    <Box px="16px" pt="16px" pb="90px">
      <Text fontSize="18px" fontWeight="800">
        Documento de identidad
      </Text>
      <Text fontSize="13px" color="fg.muted" mt="2px" mb="16px">
        Sube fotos claras de tu documento. Asegúrate de que se vea completo, enfocado y con
        todos los datos visibles.
      </Text>

      <Tabs
        variant="unstyled"
        index={data.docType === "license" ? 0 : 1}
        onChange={(i) => update({ docType: i === 0 ? "license" : "passport" })}
      >
        <TabList
          borderBottom="1px solid"
          borderColor="canvas.border"
          mb="16px"
          gap="4px"
        >
          {["Licencia de conducir", "Pasaporte"].map((l) => (
            <Tab
              key={l}
              fontSize="13px"
              fontWeight="500"
              color="fg.muted"
              px="10px"
              py="8px"
              borderBottom="2px solid transparent"
              _selected={{ color: "fg.default", fontWeight: "700", borderColor: "brand.500" }}
            >
              {l}
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          <TabPanel p="0">
            <Flex direction="column" gap="16px">
              <DocumentPhotoCapture
                label="Foto frontal"
                required
                value={data.licenseFrontImage}
                onChange={(img) => update({ licenseFrontImage: img })}
              />
              <DocumentPhotoCapture
                label="Foto posterior"
                required
                value={data.licenseBackImage}
                onChange={(img) => update({ licenseBackImage: img })}
              />
              <FormField label="Número de licencia" required>
                <Input
                  value={data.licenseNumber}
                  onChange={(e) => update({ licenseNumber: e.target.value })}
                />
              </FormField>
              <SimpleGrid columns={2} spacing="10px">
                <FormField label="País emisor" required>
                  <Select
                    value={data.licenseCountry}
                    onChange={(e) => update({ licenseCountry: e.target.value })}
                  >
                    <option value="">Selecciona</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Fecha de vencimiento" required>
                  <Input
                    type="date"
                    value={data.licenseExpiration}
                    onChange={(e) => update({ licenseExpiration: e.target.value })}
                  />
                </FormField>
              </SimpleGrid>
            </Flex>
          </TabPanel>

          <TabPanel p="0">
            <Flex direction="column" gap="16px">
              <DocumentPhotoCapture
                label="Foto de la página de datos"
                required
                value={data.passportImage}
                onChange={(img) => update({ passportImage: img })}
              />
              <FormField label="Número de pasaporte" required>
                <Input
                  value={data.passportNumber}
                  onChange={(e) => update({ passportNumber: e.target.value })}
                />
              </FormField>
              <SimpleGrid columns={2} spacing="10px">
                <FormField label="País emisor" required>
                  <Select
                    value={data.passportCountry}
                    onChange={(e) => update({ passportCountry: e.target.value })}
                  >
                    <option value="">Selecciona</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Fecha de vencimiento" required>
                  <Input
                    type="date"
                    value={data.passportExpiration}
                    onChange={(e) => update({ passportExpiration: e.target.value })}
                  />
                </FormField>
              </SimpleGrid>
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <StepNav onBack={onBack} onNext={handleNext} nextDisabled={!canContinue} />
    </Box>
  );
}
