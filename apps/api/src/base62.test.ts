import { describe, expect, it } from "vitest";
import { codeFromId, decodeBase62, encodeBase62 } from "./base62.js";

describe("base62", () => {
  it("encodes small values", () => {
    expect(encodeBase62(0n)).toBe("0");
    expect(encodeBase62(61n)).toBe("z");
    expect(encodeBase62(62n)).toBe("10");
  });

  it("round-trips", () => {
    for (const n of [1n, 99n, 123_456_789n, 2n ** 53n]) {
      expect(decodeBase62(encodeBase62(n))).toBe(n);
    }
  });

  it("rejects invalid input", () => {
    expect(() => decodeBase62("ab-c")).toThrow();
    expect(() => encodeBase62(-1n)).toThrow();
  });

  it("generates codes of at least 6 characters from id 1", () => {
    expect(codeFromId(1n).length).toBeGreaterThanOrEqual(6);
  });

  it("generates unique codes for distinct ids", () => {
    const seen = new Set<string>();
    for (let i = 1n; i <= 5000n; i++) seen.add(codeFromId(i));
    expect(seen.size).toBe(5000);
  });
});
