/**
 * @fileoverview Device wallet-address generation.
 * @description Pure helper that produces a random 20-byte hex wallet address
 * (`0x...`) for a device device. Shared so both vendor apps generate
 * addresses identically instead of duplicating the logic.
 */

/** Generate a random `0x`-prefixed 20-byte hex wallet address. */
export function generateWalletAddress(): string {
  const bytes = new Uint8Array(20);
  for (let i = 0; i < 20; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return (
    '0x' +
    Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  );
}
