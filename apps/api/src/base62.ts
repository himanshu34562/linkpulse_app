const ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const BASE = BigInt(ALPHABET.length);

// 62^5: adding this offset makes every generated code at least 6 characters.
export const CODE_OFFSET = 916_132_832n;

export function encodeBase62(n: bigint): string {
  if (n < 0n) throw new RangeError("n must be non-negative");
  if (n === 0n) return ALPHABET[0]!;
  let out = "";
  while (n > 0n) {
    out = ALPHABET[Number(n % BASE)]! + out;
    n /= BASE;
  }
  return out;
}

export function decodeBase62(s: string): bigint {
  let n = 0n;
  for (const ch of s) {
    const idx = ALPHABET.indexOf(ch);
    if (idx === -1) throw new RangeError(`invalid base62 character: ${ch}`);
    n = n * BASE + BigInt(idx);
  }
  return n;
}

export function codeFromId(id: bigint): string {
  return encodeBase62(id + CODE_OFFSET);
}
