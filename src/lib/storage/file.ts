import type { StoredImage } from "@/types";

const MAX_DIMENSION = 1400; // downscale large camera photos before persisting

/**
 * Reads a File into a compressed base64 data URL suitable for localStorage.
 * Images are downscaled and re-encoded as JPEG to keep the demo under quota.
 * Non-image files fall back to a raw data URL.
 */
export async function fileToStoredImage(file: File): Promise<StoredImage> {
  const base: Omit<StoredImage, "dataUrl"> = {
    fileName: file.name,
    uploadedAt: new Date().toISOString(),
  };

  if (!file.type.startsWith("image/")) {
    const dataUrl = await readAsDataUrl(file);
    return { ...base, dataUrl };
  }

  try {
    const dataUrl = await downscaleImage(file);
    return { ...base, dataUrl };
  } catch {
    const dataUrl = await readAsDataUrl(file);
    return { ...base, dataUrl };
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function downscaleImage(file: File): Promise<string> {
  const dataUrl = await readAsDataUrl(file);
  const img = await loadImage(dataUrl);

  let { width, height } = img;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
