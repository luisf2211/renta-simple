/**
 * Minimal dependency-free QR-looking matrix renderer. This is NOT a real QR
 * code — it is a deterministic visual placeholder for the prototype that
 * encodes the verification URL into a stable pattern. Replace with a real QR
 * library when wiring up verification.
 */
export function qrMatrix(input: string, size = 21): boolean[][] {
  const matrix: boolean[][] = [];
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Simple xorshift PRNG seeded by the hash for a stable pattern.
  let state = h >>> 0 || 1;
  const next = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };

  for (let y = 0; y < size; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < size; x++) {
      row.push(next() > 0.5);
    }
    matrix.push(row);
  }

  // Draw the three finder patterns to make it read as a QR code visually.
  const drawFinder = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const edge = x === 0 || x === 6 || y === 0 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        const row = matrix[oy + y];
        if (row) row[ox + x] = edge || core;
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(size - 7, 0);
  drawFinder(0, size - 7);

  return matrix;
}
