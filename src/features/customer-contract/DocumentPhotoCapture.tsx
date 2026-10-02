"use client";

import { useRef } from "react";
import { Box, Flex, Text, Button, Image, IconButton } from "@chakra-ui/react";
import { Camera, Upload, X, RefreshCw } from "lucide-react";
import type { StoredImage } from "@/types";
import { fileToStoredImage } from "@/lib/storage/file";

/**
 * Capture or upload a single document photo. On mobile the camera input uses
 * `capture="environment"` to open the rear camera; a separate control allows
 * picking from the gallery/files. Shows a preview with replace/remove.
 *
 * Images are persisted as base64 (handled upstream in the demo store); any
 * transient object URLs would be revoked, but fileToStoredImage reads into a
 * data URL so there is nothing to leak here.
 */
export function DocumentPhotoCapture({
  label,
  required,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  value?: StoredImage;
  onChange: (image: StoredImage | undefined) => void;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const image = await fileToStoredImage(file);
    onChange(image);
  };

  return (
    <Box>
      <Flex align="center" gap="4px" mb="6px">
        <Text fontSize="12px" fontWeight="600">
          {label}
        </Text>
        {required && (
          <Box as="span" color="brand.500" aria-hidden>
            *
          </Box>
        )}
      </Flex>

      {value ? (
        <Box
          position="relative"
          border="1px solid"
          borderColor="canvas.border"
          borderRadius="8px"
          overflow="hidden"
          bg="canvas.subtle"
        >
          <Image src={value.dataUrl} alt={label} w="100%" display="block" />
          <IconButton
            aria-label="Quitar foto"
            icon={<X size={14} />}
            size="xs"
            position="absolute"
            top="6px"
            right="6px"
            bg="white"
            boxShadow="sm"
            onClick={() => onChange(undefined)}
          />
          <Flex
            position="absolute"
            bottom="0"
            left="0"
            right="0"
            bg="rgba(255,255,255,0.92)"
            borderTop="1px solid"
            borderColor="canvas.border"
            p="6px"
            gap="6px"
          >
            <Button
              size="xs"
              variant="ghost"
              flex="1"
              leftIcon={<RefreshCw size={13} />}
              onClick={() => fileRef.current?.click()}
            >
              Reemplazar
            </Button>
            <Button
              size="xs"
              variant="ghost"
              flex="1"
              color="brand.600"
              leftIcon={<X size={13} />}
              onClick={() => onChange(undefined)}
            >
              Quitar
            </Button>
          </Flex>
        </Box>
      ) : (
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap="10px"
          border="1px dashed"
          borderColor="canvas.border"
          borderRadius="8px"
          bg="canvas.subtle"
          py="22px"
          px="12px"
        >
          <Camera size={24} color="#8c959f" />
          <Text fontSize="12px" color="fg.muted" textAlign="center">
            Toma una foto clara y bien enfocada.
          </Text>
          <Flex gap="8px" wrap="wrap" justify="center">
            <Button
              size="sm"
              colorScheme="red"
              bg="brand.500"
              _hover={{ bg: "brand.600" }}
              leftIcon={<Camera size={14} />}
              onClick={() => cameraRef.current?.click()}
            >
              Tomar foto
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Upload size={14} />}
              onClick={() => fileRef.current?.click()}
            >
              Subir archivo
            </Button>
          </Flex>
        </Flex>
      )}

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </Box>
  );
}
