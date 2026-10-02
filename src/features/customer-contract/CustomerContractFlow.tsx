"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Center, Spinner, useToast } from "@chakra-ui/react";
import { useDemoStore } from "@/store/demo-store";
import { CustomerShell, type CustomerStep } from "./CustomerShell";
import { ContractReview } from "./ContractReview";
import { CustomerInformationForm } from "./CustomerInformationForm";
import { IdentityDocumentForm, type IdentityData } from "./IdentityDocumentForm";
import { SignatureStep } from "./SignatureStep";
import { SignedConfirmation } from "./SignedConfirmation";
import { NotFoundCard } from "./NotFoundCard";
import type { CustomerInfoValues } from "@/schemas/customer.schema";
import { buildSignedSnapshot } from "@/lib/signature/snapshot";

export function CustomerContractFlow({ token }: { token: string }) {
  const {
    ready,
    dataSource,
    getContractByToken,
    getCustomer,
    getVehicle,
    tenant,
    patchContract,
    patchCustomer,
    appendEvent,
    signContract,
    uploadCustomerDocument,
    refreshContract,
  } = useDemoStore();
  const toast = useToast();
  const isSupabase = dataSource === "supabase";

  const contract = getContractByToken(token);
  const customer = contract ? getCustomer(contract.customerId) : undefined;
  const vehicle = contract ? getVehicle(contract.vehicleId) : undefined;

  const alreadySigned = !!contract && contract.status === "SIGNED";
  const [step, setStep] = useState<CustomerStep>("review");

  // If the contract is already signed, land on the confirmation screen.
  useEffect(() => {
    if (alreadySigned) setStep("done");
  }, [alreadySigned]);

  // Mark as VIEWED once, when a sent contract is opened by the customer.
  useEffect(() => {
    if (ready && contract && contract.status === "SENT") {
      patchContract(contract.id, {
        status: "VIEWED",
        viewedAt: new Date().toISOString(),
      });
      appendEvent(contract.id, "CONTRACT_VIEWED", customer?.fullName ?? "Cliente", "El cliente abrió el contrato.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, contract?.id]);

  const identityInitial = useMemo<IdentityData>(
    () => ({
      licenseFrontImage: customer?.licenseFrontImage,
      licenseBackImage: customer?.licenseBackImage,
      passportImage: customer?.passportImage,
      licenseNumber: customer?.licenseNumber ?? "",
      licenseCountry: customer?.licenseCountry ?? "",
      licenseExpiration: customer?.licenseExpiration ?? "",
      passportNumber: customer?.passportNumber ?? "",
      passportCountry: customer?.passportCountry ?? "",
      passportExpiration: customer?.passportExpiration ?? "",
      docType: "license",
    }),
    [customer],
  );

  if (!ready) {
    return (
      <Center minH="100dvh">
        <Spinner color="brand.500" thickness="2px" />
      </Center>
    );
  }

  if (!contract || !customer || !vehicle) {
    return <NotFoundCard logo={tenant.logo} />;
  }

  const handleInfoSubmit = (values: CustomerInfoValues) => {
    patchCustomer(customer.id, {
      fullName: values.fullName,
      dateOfBirth: values.dateOfBirth,
      nationality: values.nationality,
      phone: values.phone,
      email: values.email,
      address: values.address ?? "",
      city: values.city ?? "",
      postalCode: values.postalCode ?? "",
      country: values.country || customer.country,
    });
    appendEvent(contract.id, "CUSTOMER_INFO_UPDATED", customer.fullName, "El cliente completó su información.");
    toast({ title: "Información actualizada.", status: "success", duration: 1600 });
    setStep("document");
  };

  const handleIdentitySubmit = async (data: IdentityData) => {
    // In Supabase mode, upload each captured photo to private Storage and keep
    // the returned signed URL for immediate display; license data is persisted
    // on the customer record.
    let licenseFront = data.licenseFrontImage;
    let licenseBack = data.licenseBackImage;
    let passport = data.passportImage;

    if (isSupabase) {
      try {
        if (data.docType === "license") {
          if (data.licenseFrontImage?.dataUrl?.startsWith("data:")) {
            const r = await uploadCustomerDocument({
              customerId: customer.id,
              slot: "licenseFront",
              dataUrl: data.licenseFrontImage.dataUrl,
              fileName: data.licenseFrontImage.fileName,
            });
            if (r) licenseFront = { dataUrl: r.dataUrl };
          }
          if (data.licenseBackImage?.dataUrl?.startsWith("data:")) {
            const r = await uploadCustomerDocument({
              customerId: customer.id,
              slot: "licenseBack",
              dataUrl: data.licenseBackImage.dataUrl,
              fileName: data.licenseBackImage.fileName,
            });
            if (r) licenseBack = { dataUrl: r.dataUrl };
          }
        } else if (data.passportImage?.dataUrl?.startsWith("data:")) {
          const r = await uploadCustomerDocument({
            customerId: customer.id,
            slot: "passport",
            dataUrl: data.passportImage.dataUrl,
            fileName: data.passportImage.fileName,
          });
          if (r) passport = { dataUrl: r.dataUrl };
        }
      } catch (e) {
        toast({ title: "No se pudo subir el documento.", status: "error", duration: 2600 });
        return;
      }
    }

    patchCustomer(customer.id, {
      licenseFrontImage: licenseFront,
      licenseBackImage: licenseBack,
      passportImage: passport,
      licenseNumber: data.docType === "license" ? data.licenseNumber : customer.licenseNumber,
      licenseCountry: data.docType === "license" ? data.licenseCountry : customer.licenseCountry,
      licenseExpiration:
        data.docType === "license" ? data.licenseExpiration : customer.licenseExpiration,
      passportNumber: data.passportNumber,
      passportCountry: data.passportCountry,
      passportExpiration: data.passportExpiration,
      isProfileComplete: true,
    });
    appendEvent(contract.id, "DOCUMENT_UPLOADED", customer.fullName, "El cliente cargó su documento de identidad.");
    toast({ title: "Documento agregado.", status: "success", duration: 1600 });
    setStep("signature");
  };

  const handleSign = async (signature: string) => {
    if (isSupabase) {
      // Server builds the immutable snapshot, uploads the signature, flips
      // status to SIGNED and logs the event.
      try {
        await signContract(token, signature);
        await refreshContract(contract.id);
        toast({ title: "Contrato firmado correctamente.", status: "success", duration: 2200 });
        setStep("done");
      } catch (e) {
        toast({ title: "No se pudo firmar el contrato.", status: "error", duration: 2800 });
      }
      return;
    }

    // Mock mode: build the snapshot locally.
    const freshCustomer = getCustomer(customer.id) ?? customer;
    const { snapshot, metadata } = buildSignedSnapshot({
      contract,
      customer: freshCustomer,
      vehicle,
      tenant,
      customerSignature: signature,
    });

    patchContract(contract.id, {
      status: "SIGNED",
      signedAt: metadata.signedAt,
      signature,
      signatureMetadata: metadata,
      signedSnapshot: snapshot,
    });
    appendEvent(contract.id, "CONTRACT_SIGNED", freshCustomer.fullName, "Contrato firmado digitalmente.");
    toast({ title: "Contrato firmado correctamente.", status: "success", duration: 2200 });
    setStep("done");
  };

  return (
    <CustomerShell logo={tenant.logo} logoUrl={tenant.logoUrl} step={step} showProgress={step !== "done"}>
      {step === "review" && (
        <ContractReview
          contract={contract}
          customer={customer}
          vehicle={vehicle}
          tenant={tenant}
          onContinue={() => setStep("info")}
          onRequestChange={() => {
            patchContract(contract.id, { status: "CHANGES_REQUESTED" });
            appendEvent(contract.id, "CHANGES_REQUESTED", customer.fullName, "El cliente solicitó una corrección.");
          }}
        />
      )}
      {step === "info" && (
        <CustomerInformationForm
          customer={customer}
          onBack={() => setStep("review")}
          onSubmit={handleInfoSubmit}
        />
      )}
      {step === "document" && (
        <IdentityDocumentForm
          initial={identityInitial}
          onBack={() => setStep("info")}
          onSubmit={handleIdentitySubmit}
        />
      )}
      {step === "signature" && (
        <SignatureStep
          contract={contract}
          vehicle={vehicle}
          tenant={tenant}
          signerName={customer.fullName}
          onBack={() => setStep("document")}
          onSign={handleSign}
        />
      )}
      {step === "done" && <SignedConfirmation contract={getContractByToken(token) ?? contract} />}
    </CustomerShell>
  );
}
