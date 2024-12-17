import { describe, it, expect} from 'vitest'
import { signJwt, verifyJwt } from "./jwt.js";

const mockPayload = { sub: '12345' }

describe("JWT Utilities", () => {
    it("should generate a valid JWT token", () => {
        const token = signJwt(mockPayload)
        expect(token).toBeDefined()
        expect(typeof token).toBe("string")
    })
    it("should verify a valid JWT token", () => {
        const token = signJwt(mockPayload)
        const decoded = verifyJwt(token)

        expect(decoded).toBeDefined()
        expect(decoded.sub).toBe(mockPayload.sub)
    })
    it("should throw an error for an invalid JWT token", () => {
        const invalidToken = "invalid.token"

        expect(() => verifyJwt(invalidToken)).toThrow()
    })
    it("should throw an error for an expired JWT token", () => {
        const expiredToken = signJwt(mockPayload, {expiresIn: "-1s"})

        expect(() => verifyJwt(expiredToken)).toThrow("jwt expired")
    })
    it("should throw an error when JWT_SECRET is invalid", () => {
        const token = signJwt(mockPayload, "wrong_secret");
        expect(() => verifyJwt(token)).toThrow();
      });
})