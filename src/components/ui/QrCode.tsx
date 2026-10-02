"use client";

import { qrMatrix } from "@/lib/signature/qr";

/**
 * Renders the deterministic QR-style matrix (see lib/signature/qr.ts). This is
 * a visual placeholder for the prototype, not a scannable code. Swap for a real
 * QR library when wiring up verification.
 */
export function QrCode({ value, size = 92 }: { value: string; size?: number }) {
  const matrix = qrMatrix(value, 21);
  const cells = matrix.length;
  const cell = size / cells;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Código QR de verificación (demostración)"
      style={{ display: "block" }}
    >
      <rect width={size} height={size} fill="#ffffff" />
      {matrix.map((row, y) =>
        row.map((on, x) =>
          on ? (
            <rect
              key={`${x}-${y}`}
              x={x * cell}
              y={y * cell}
              width={cell}
              height={cell}
              fill="#1f2328"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}
