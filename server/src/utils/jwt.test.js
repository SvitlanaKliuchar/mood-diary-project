import { describe, it, expect, vi } from "vitest";
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from "./jwt.js";

describe("JWT Utilities", () => {
  it("should generate a valid access token", () => {
    const token = signAccessToken({ sub: 12345 });
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    //decode it just to confirm 'sub' is present
    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe(12345);
  });

  it("should generate a valid refresh token", () => {
    const token = signRefreshToken({ sub: 54321 });
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    const decoded = verifyRefreshToken(token);
    expect(decoded.sub).toBe(54321);
  });

  it("should verify a valid access token", () => {
    const token = signAccessToken({ sub: "abc" });
    const decoded = verifyAccessToken(token);
    expect(decoded).toBeDefined();
    expect(decoded.sub).toBe("abc");
  });

  it("should verify a valid refresh token", () => {
    const token = signRefreshToken({ sub: "def" });
    const decoded = verifyRefreshToken(token);
    expect(decoded).toBeDefined();
    expect(decoded.sub).toBe("def");
  });

  it("should throw error for invalid or expired access token", () => {
    const fakeToken = "invalid.token.data";

    expect(() => verifyAccessToken(fakeToken)).toThrow();
  });
});