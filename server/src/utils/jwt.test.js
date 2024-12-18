import { describe, it, expect, vi} from 'vitest'
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
    it("should throw an error for an expired JWT token", () => {
        const expiredToken = signJwt(mockPayload, {expiresIn: "-1s"})

        expect(() => verifyJwt(expiredToken)).toThrow("jwt expired")
    })
})