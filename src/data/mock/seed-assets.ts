/**
 * Seeded demo signatures (handwritten-looking SVG paths as data URLs). These
 * are ONLY used for contracts that are already signed in the demo seed. When a
 * user signs manually, the real captured canvas data URL is stored instead.
 */

function signatureDataUrl(path: string, color = "#1f2328"): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="120" viewBox="0 0 300 120">
  <path d="${path}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// A flowing "Juan Pérez"-like scribble.
export const SEED_SIGNATURE_CUSTOMER = signatureDataUrl(
  "M20 80 C 30 40, 45 40, 50 70 C 55 90, 60 50, 70 60 C 78 68, 72 85, 85 78 C 100 70, 95 45, 110 50 C 120 53, 115 80, 128 75 M135 55 C 150 50, 160 65, 150 75 C 142 83, 138 70, 148 62 M165 55 L170 80 M165 60 C 175 48, 190 50, 192 62 C 194 72, 182 72, 180 66 M205 55 C 198 70, 205 85, 215 78 C 225 72, 222 58, 212 58 M232 78 L240 50 C 244 62, 250 62, 252 52 M262 50 C 255 65, 262 82, 272 74",
  "#1f2328",
);

// A quick "Christian Aybar"-like representative mark.
export const SEED_SIGNATURE_REPRESENTATIVE = signatureDataUrl(
  "M30 70 C 50 30, 70 90, 95 55 C 115 28, 140 95, 170 55 C 195 25, 220 90, 255 50 C 265 42, 272 60, 268 72",
  "#1f2328",
);

/**
 * Tiny inline-SVG stand-ins for an uploaded ID document photo. Used so the
 * signed document and admin documents tab show "real" captured images in the
 * demo without shipping binary assets.
 */
export function idPhotoPlaceholder(
  title: string,
  subtitle: string,
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="340" height="214" viewBox="0 0 340 214">
  <rect width="340" height="214" rx="8" fill="#eef1f4" stroke="#d0d7de"/>
  <rect x="12" y="12" width="316" height="34" rx="4" fill="#e5312f"/>
  <text x="24" y="34" font-family="sans-serif" font-size="13" font-weight="700" fill="#ffffff">${esc(
    title,
  )}</text>
  <rect x="24" y="64" width="96" height="118" rx="4" fill="#cdd3da"/>
  <circle cx="72" cy="104" r="22" fill="#9aa4af"/>
  <path d="M44 170 c 6 -26 50 -26 56 0 z" fill="#9aa4af"/>
  <rect x="140" y="70" width="170" height="12" rx="3" fill="#c3cad2"/>
  <rect x="140" y="94" width="140" height="12" rx="3" fill="#c3cad2"/>
  <rect x="140" y="118" width="160" height="12" rx="3" fill="#c3cad2"/>
  <rect x="140" y="142" width="110" height="12" rx="3" fill="#c3cad2"/>
  <text x="24" y="202" font-family="sans-serif" font-size="11" fill="#656d76">${esc(
    subtitle,
  )}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
