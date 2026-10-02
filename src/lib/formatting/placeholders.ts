/**
 * Deterministic inline-SVG placeholder for a vehicle "photo". Keeps the
 * prototype free of binary assets while still showing an image slot.
 */
export function vehiclePlaceholder(label: string, color = "#8c959f"): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200">
  <rect width="320" height="200" fill="#f6f8fa"/>
  <g fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M60 128 l16 -40 a16 16 0 0 1 15 -11 h98 a16 16 0 0 1 13 7 l24 36 h30 a14 14 0 0 1 14 14 v18 h-26"/>
    <path d="M60 128 h-6 a10 10 0 0 0 -10 10 v14 h22"/>
    <line x1="96" y1="152" x2="200" y2="152"/>
    <circle cx="104" cy="152" r="18" fill="#ffffff"/>
    <circle cx="226" cy="152" r="18" fill="#ffffff"/>
  </g>
  <text x="160" y="186" font-family="sans-serif" font-size="13" fill="#656d76" text-anchor="middle">${escapeXml(
    label,
  )}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
