"use client";

import { useRef, useState } from "react";
import { Box, Flex, Text, Button, Image, Spinner } from "@chakra-ui/react";
import { Upload, ImagePlus } from "lucide-react";
import { fileToStoredImage } from "@/lib/storage/file";

/**
 * Generic image picker that downscales the chosen file and hands a data URL to
 * `onSelect` (async — the caller uploads it to Storage and may return). Shows a
 * preview from `currentUrl` when provided.
 */
export function ImageUpload({
  label,
  currentUrl,
  onSelect,
  aspect = "16/10",
  compact,
}: {
  label: string;
  currentUrl?: string;
  onSelect: (dataUrl: string, fileName?: string) => Promise<void> | void;
  aspect?: string;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const img = await fileToStoredImage(file);
      await onSelect(img.dataUrl, img.fileName);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box>
      {label && (
        <Text fontSize="12px" fontWeight="600" mb="6px">
          {label}
        </Text>
      )}
      <Flex
        align="center"
        gap="12px"
        direction={compact ? "row" : "column"}
      >
        <Box
          position="relative"
          w={compact ? "120px" : "100%"}
          maxW={compact ? "120px" : "260px"}
          sx={{ aspectRatio: aspect }}
          border="1px solid"
          borderColor="canvas.border"
          borderRadius="8px"
          overflow="hidden"
          bg="canvas.subtle"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          {busy ? (
            <Spinner size="sm" color="brand.500" />
          ) : currentUrl ? (
            <Image src={currentUrl} alt={label} w="100%" h="100%" objectFit="contain" />
          ) : (
            <ImagePlus size={24} color="#8c959f" />
          )}
        </Box>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Upload size={14} />}
          onClick={() => inputRef.current?.click()}
          isDisabled={busy}
        >
          {currentUrl ? "Reemplazar" : "Subir imagen"}
        </Button>
      </Flex>
      <input
        ref={inputRef}
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
