/** Prototype-only identifiers. Replace with real signing/verification later. */

export function generateVerificationId(): string {
  // 32 hex chars, uppercase, grouped like the render (8-4-4-4-...)
  const hex = randomHex(32).toUpperCase();
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

/** Fake "SHA-256" style hash label for the demo document. */
export function generateDocumentHash(): string {
  return `SHA-256: ${randomHex(64)}`;
}

export function generateId(prefix = "id"): string {
  return `${prefix}_${randomHex(10)}`;
}

function randomHex(len: number): string {
  const bytes = new Uint8Array(Math.ceil(len / 2));
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, len);
}
