import { describe, it, expect } from 'vitest'
import { registerSchema, loginSchema } from './auth-validation.js'

describe("Auth Validation", () => {
    it("should validate a correct registration payload", () => {
        const validPayload = { username: "testuser", password: "Password123!"}
        expect(() => registerSchema.parse(validPayload)).not.toThrow()
    })
    it("should reject registration with an invalid username", () => {
        const invalidPayload = { username: "tu", password: "Password123!"}
        expect(() => registerSchema.parse(invalidPayload)).toThrow("Username must be at least 3 characters long")
    })
    it("should reject registration with a weak password", () => {
        const invalidPayload = { username: "testuser", password: "weak"}
        expect(() => registerSchema.parse(invalidPayload)).toThrow("Password must be at least 6 characters long")
    })
    it("should validate a correct login payload", () => {
        const validPayload = { username: "testuser", password: "Password123!"}
        expect(() => loginSchema.parse(validPayload)).not.toThrow()
    })
    it("should reject login with missing fields", () => {
        const invalidPayload = { username: "testuser", password: ""}
        expect(() => loginSchema.parse(invalidPayload)).toThrow("Password must be at least 6 characters long")
    })
})