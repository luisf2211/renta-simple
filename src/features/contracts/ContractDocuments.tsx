"use client";

import { useRef } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Image,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/react";
import { Upload, Eye, Download, FileText } from "lucide-react";
import type { Contract, ContractDocument, StoredImage } from "@/types";
import { useDemoStore } from "@/store/demo-store";
import { formatDate } from "@/lib/formatting/format";
import { generateId } from "@/lib/signature/verification";
import { fileToStoredImage } from "@/lib/storage/file";
import { useState } from "react";

export function ContractDocuments({ contract }: { contract: Contract }) {
  const { patchContract, appendEvent } = useDemoStore();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<StoredImage | null>(null);
  const previewModal = useDisclosure();

  const handleUpload = async (file: File) => {
    const image = await fileToStoredImage(file);
    const doc: ContractDocument = {
      id: generateId("doc"),
      name: file.name,
      type: guessType(file.name),
      addedAt: new Date().toISOString(),
      image,
    };
    patchContract(contract.id, { documents: [...contract.documents, doc] });
    appendEvent(contract.id, "DOCUMENT_UPLOADED", "Christian", `Documento agregado: ${file.name}`);
    toast({ title: "Documento agregado.", status: "success", duration: 2000 });
  };

  const openPreview = (image?: StoredImage) => {
    if (!image) {
      toast({ title: "Este documento no tiene vista previa.", status: "info", duration: 2000 });
      return;
    }
    setPreview(image);
    previewModal.onOpen();
  };

  return (
    <Box p="20px">
      <Flex align="center" justify="space-between" mb="12px">
        <Text fontSize="14px" fontWeight="700">
          Documentos
        </Text>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Upload size={14} />}
          onClick={() => inputRef.current?.click()}
        >
          Subir
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleUpload(file);
            e.target.value = "";
          }}
        />
      </Flex>

      {contract.documents.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          gap="6px"
          py="40px"
          color="fg.subtle"
          border="1px dashed"
          borderColor="canvas.border"
          borderRadius="8px"
        >
          <FileText size={22} />
          <Text fontSize="13px">Sin documentos todavía.</Text>
        </Flex>
      ) : (
        <Box border="1px solid" borderColor="canvas.border" borderRadius="8px" overflow="hidden">
          <Table size="sm" variant="simple">
            <Thead bg="canvas.subtle">
              <Tr>
                <Th fontSize="11px">Nombre</Th>
                <Th fontSize="11px">Tipo</Th>
                <Th fontSize="11px">Fecha</Th>
                <Th fontSize="11px" textAlign="right">Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {contract.documents.map((d) => (
                <Tr key={d.id}>
                  <Td fontSize="13px" fontWeight="500">{d.name}</Td>
                  <Td fontSize="12px" color="fg.muted">{d.type}</Td>
                  <Td fontSize="12px" color="fg.muted">{formatDate(d.addedAt)}</Td>
                  <Td>
                    <Flex gap="2px" justify="flex-end">
                      <IconButton
                        aria-label="Ver documento"
                        icon={<Eye size={14} />}
                        size="xs"
                        variant="ghost"
                        onClick={() => openPreview(d.image)}
                      />
                      <IconButton
                        aria-label="Descargar documento"
                        icon={<Download size={14} />}
                        size="xs"
                        variant="ghost"
                        onClick={() =>
                          toast({ title: "Descarga simulada.", status: "info", duration: 1800 })
                        }
                      />
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <Modal isOpen={previewModal.isOpen} onClose={previewModal.onClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p="16px">
            {preview && (
              <Image src={preview.dataUrl} alt="Vista previa del documento" w="100%" borderRadius="6px" />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

function guessType(name: string): ContractDocument["type"] {
  const n = name.toLowerCase();
  if (n.includes("licencia") || n.includes("license")) return "Licencia";
  if (n.includes("pasaporte") || n.includes("passport")) return "Pasaporte";
  if (n.endsWith(".pdf")) return "Contrato";
  return "Otro";
}
