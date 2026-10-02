"use client";

import { useEffect, useState } from "react";
import { Box, Flex, Text, Input, Button, SimpleGrid, useToast, Divider } from "@chakra-ui/react";
import { Save } from "lucide-react";
import { useDemoStore } from "@/store/demo-store";
import { FormField } from "@/components/ui/FormField";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Section } from "@/components/ui/Section";

export function BusinessSettings() {
  const { tenant, updateTenant, uploadTenantLogo } = useDemoStore();
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    businessName: tenant.businessName,
    legalName: tenant.legalName,
    email: tenant.email,
    phone: tenant.phone,
    secondaryPhone: tenant.secondaryPhone ?? "",
    address: tenant.address,
    country: tenant.country,
    taxId: tenant.taxId ?? "",
  });

  // Keep form in sync if tenant reloads.
  useEffect(() => {
    setForm({
      businessName: tenant.businessName,
      legalName: tenant.legalName,
      email: tenant.email,
      phone: tenant.phone,
      secondaryPhone: tenant.secondaryPhone ?? "",
      address: tenant.address,
      country: tenant.country,
      taxId: tenant.taxId ?? "",
    });
  }, [tenant]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      await updateTenant({
        businessName: form.businessName,
        legalName: form.legalName,
        email: form.email,
        phone: form.phone,
        secondaryPhone: form.secondaryPhone,
        address: form.address,
        country: form.country,
        taxId: form.taxId,
      });
      toast({ title: "Información actualizada.", status: "success", duration: 1800 });
    } catch {
      toast({ title: "No se pudo guardar.", status: "error", duration: 2400 });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box maxW="640px">
      <Box mb="24px">
        <Section title="Logo del negocio">
          <Text fontSize="12px" color="fg.muted" mb="12px">
            Se usa en el panel, el contrato del cliente y el documento firmado.
          </Text>
          <ImageUpload
            label=""
            currentUrl={tenant.logoUrl}
            compact
            aspect="16/9"
            onSelect={async (dataUrl, fileName) => {
              await uploadTenantLogo({ dataUrl, fileName });
              toast({ title: "Logo actualizado.", status: "success", duration: 1800 });
            }}
          />
        </Section>
      </Box>

      <Divider mb="20px" />

      <Section title="Datos del negocio">
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing="12px" mt="4px">
          <FormField label="Nombre comercial">
            <Input value={form.businessName} onChange={set("businessName")} />
          </FormField>
          <FormField label="Razón social">
            <Input value={form.legalName} onChange={set("legalName")} />
          </FormField>
          <FormField label="Email">
            <Input value={form.email} onChange={set("email")} type="email" />
          </FormField>
          <FormField label="RNC / Tax ID">
            <Input value={form.taxId} onChange={set("taxId")} />
          </FormField>
          <FormField label="Teléfono principal">
            <Input value={form.phone} onChange={set("phone")} />
          </FormField>
          <FormField label="Teléfono secundario">
            <Input value={form.secondaryPhone} onChange={set("secondaryPhone")} />
          </FormField>
          <FormField label="Dirección">
            <Input value={form.address} onChange={set("address")} />
          </FormField>
          <FormField label="País">
            <Input value={form.country} onChange={set("country")} />
          </FormField>
        </SimpleGrid>

        <Flex justify="flex-end" mt="16px">
          <Button
            size="sm"
            colorScheme="red"
            bg="brand.500"
            _hover={{ bg: "brand.600" }}
            leftIcon={<Save size={14} />}
            onClick={save}
            isLoading={saving}
          >
            Guardar cambios
          </Button>
        </Flex>
      </Section>
    </Box>
  );
}
