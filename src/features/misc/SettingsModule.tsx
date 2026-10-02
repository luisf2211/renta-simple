"use client";

import {
  Box,
  Flex,
  Text,
  Button,
  Divider,
  useToast,
  Tag,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { RotateCcw, ExternalLink } from "lucide-react";
import { useDemoStore } from "@/store/demo-store";
import { BusinessSettings } from "./BusinessSettings";
import { AmenitiesManager } from "./AmenitiesManager";
import { LocationsManager } from "./LocationsManager";

export function SettingsModule() {
  const { resetDemo, loadScenario, dataSource, refresh, contracts } = useDemoStore();
  const toast = useToast();
  const isSupabase = dataSource === "supabase";

  const scenarios: { key: "A" | "B" | "C"; label: string; token: string; desc: string }[] = [
    { key: "A", label: "Escenario A — AR-1058", token: "demo-ar-1058", desc: "Cliente nuevo · pendiente de firma" },
    { key: "B", label: "Escenario B — AR-1057", token: "demo-ar-1057", desc: "Cliente recurrente · pendiente" },
    { key: "C", label: "Escenario C — AR-1056", token: "demo-ar-1056", desc: "Contrato ya firmado" },
  ];

  return (
    <Flex direction="column" h="100%" minH={0}>
      <Box px="20px" pt="16px" pb="10px">
        <Text fontSize="18px" fontWeight="700">
          Configuración
        </Text>
        <Text fontSize="13px" color="fg.muted">
          Negocio, amenidades y utilidades de demostración.
        </Text>
      </Box>

      <Tabs variant="unstyled" display="flex" flexDirection="column" flex="1" minH={0}>
        <TabList px="20px" borderBottom="1px solid" borderColor="canvas.border" gap="2px">
          {["Negocio", "Amenidades", "Ubicaciones", "Demo"].map((l) => (
            <Tab
              key={l}
              fontSize="13px"
              fontWeight="500"
              color="fg.muted"
              px="10px"
              py="10px"
              borderBottom="2px solid transparent"
              _selected={{ color: "fg.default", fontWeight: "600", borderColor: "brand.500" }}
            >
              {l}
            </Tab>
          ))}
        </TabList>

        <TabPanels flex="1" minH={0} overflowY="auto">
          <TabPanel p="20px">
            <BusinessSettings />
          </TabPanel>

          <TabPanel p="20px">
            {isSupabase ? (
              <AmenitiesManager />
            ) : (
              <Text fontSize="13px" color="fg.muted">
                Las amenidades requieren la conexión a Supabase. Cambia a modo
                Supabase para gestionarlas.
              </Text>
            )}
          </TabPanel>

          <TabPanel p="20px">
            {isSupabase ? (
              <LocationsManager />
            ) : (
              <Text fontSize="13px" color="fg.muted">
                Las ubicaciones requieren la conexión a Supabase. Cambia a modo
                Supabase para gestionarlas.
              </Text>
            )}
          </TabPanel>

          <TabPanel p="20px">
            <Box
              maxW="640px"
              border="1px solid"
              borderColor="canvas.border"
              borderRadius="8px"
              p="16px"
              bg="canvas.subtle"
            >
              <Flex align="center" gap="8px" mb="4px">
                <Text fontSize="13px" fontWeight="700">
                  {isSupabase ? "Fuente de datos" : "Demo"}
                </Text>
                <Tag size="sm" colorScheme={isSupabase ? "green" : "gray"} fontSize="10px">
                  {isSupabase ? "Supabase" : "Solo desarrollo"}
                </Tag>
              </Flex>

              {isSupabase ? (
                <>
                  <Text fontSize="12px" color="fg.muted" mb="14px">
                    La aplicación está conectada a la base de datos real (Supabase). Los cambios
                    se guardan en el servidor.
                  </Text>
                  <Flex align="center" justify="space-between" gap="12px">
                    <Box>
                      <Text fontSize="13px" fontWeight="600">
                        Recargar datos
                      </Text>
                      <Text fontSize="12px" color="fg.muted">
                        Vuelve a cargar contratos, clientes, vehículos y amenidades.
                      </Text>
                    </Box>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<RotateCcw size={14} />}
                      onClick={() => {
                        void refresh();
                        toast({ title: "Datos recargados.", status: "success", duration: 1800 });
                      }}
                    >
                      Recargar
                    </Button>
                  </Flex>
                </>
              ) : (
                <>
                  <Text fontSize="12px" color="fg.muted" mb="14px">
                    Herramientas para probar el prototipo. No forman parte de la operación.
                  </Text>
                  <Flex direction="column" gap="8px" mb="16px">
                    {scenarios.map((s) => (
                      <Flex
                        key={s.key}
                        align="center"
                        justify="space-between"
                        gap="12px"
                        p="10px"
                        bg="white"
                        border="1px solid"
                        borderColor="canvas.border"
                        borderRadius="6px"
                      >
                        <Box>
                          <Text fontSize="13px" fontWeight="600">
                            {s.label}
                          </Text>
                          <Text fontSize="12px" color="fg.muted">
                            {s.desc}
                          </Text>
                        </Box>
                        <Flex gap="6px" flexShrink={0}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              loadScenario(s.key);
                              toast({ title: `Escenario ${s.key} cargado.`, status: "success", duration: 2000 });
                            }}
                          >
                            Cargar
                          </Button>
                          <Button
                            as={NextLink}
                            href={`/c/${s.token}`}
                            target="_blank"
                            size="sm"
                            variant="outline"
                            rightIcon={<ExternalLink size={13} />}
                          >
                            Vista cliente
                          </Button>
                        </Flex>
                      </Flex>
                    ))}
                  </Flex>
                  <Divider mb="14px" />
                  <Flex align="center" justify="space-between" gap="12px">
                    <Box>
                      <Text fontSize="13px" fontWeight="600">
                        Restablecer datos demo
                      </Text>
                      <Text fontSize="12px" color="fg.muted">
                        Borra los cambios locales y restaura los datos de ejemplo.
                      </Text>
                    </Box>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      leftIcon={<RotateCcw size={14} />}
                      onClick={() => {
                        resetDemo();
                        toast({ title: "Datos demo restablecidos.", status: "success", duration: 2000 });
                      }}
                    >
                      Restablecer
                    </Button>
                  </Flex>
                </>
              )}

              <Text fontSize="11px" color="fg.subtle" mt="16px">
                {isSupabase
                  ? `Conectado a Supabase · ${contracts.length} contratos cargados.`
                  : "Prototipo sin backend. Los datos se guardan localmente en este navegador."}
              </Text>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
}
