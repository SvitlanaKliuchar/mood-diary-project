import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "./auth-validation.js";

describe("Auth Validation", () => {
  it("should validate a correct registration payload", () => {
    const validPayload = {
      username: "testuser",
      email: "test@example.com",
      password: "Password123!",
      repeatPassword: "Password123!",
    };
    expect(() => registerSchema.parse(validPayload)).not.toThrow();
  });

  it("should reject registration with an invalid username", () => {
    const invalidPayload = {
      username: "tu",
      email: "test@example.com",
      password: "Password123!",
      repeatPassword: "Password123!",
    };
    expect(() => registerSchema.parse(invalidPayload)).toThrow(
      "Username must be at least 3 characters long",
    );
  });

  it("should reject registration with a weak password", () => {
    const invalidPayload = {
      username: "testuser",
      email: "test@example.com",
      password: "weak",
      repeatPassword: "weak",
    };
    expect(() => registerSchema.parse(invalidPayload)).toThrow(
      "Password must be at least 6 characters long",
    );
  });

  it("should reject if repeatPassword does not match", () => {
    const invalidPayload = {
      username: "testuser",
      email: "test@example.com",
      password: "Password123!",
      repeatPassword: "Different123!",
    };
    expect(() => registerSchema.parse(invalidPayload)).toThrow(
      "Passwords do not match.",
    );
  });

  it("should validate a correct login payload", () => {
    const validPayload = {
      identifier: "testuser",
      password: "Password123!",
    };
    expect(() => loginSchema.parse(validPayload)).not.toThrow();
  });

  it("should reject login if password is too short", () => {
    const invalidPayload = {
      identifier: "test@example.com",
      password: "short",
    };
    expect(() => loginSchema.parse(invalidPayload)).toThrow(
      "Password must be at least 6 characters long",
    );
  });

  it("should reject login if identifier is missing", () => {
    const invalidPayload = {
      password: "Password123!",
    };
    expect(() => loginSchema.parse(invalidPayload)).toThrow(
      "Username or email are required.",
    );
  });

  it("should reject login if identifier is invalid (not email or username)", () => {
    const invalidPayload = {
      identifier: "invalid identifier",
      password: "Password123!",
    };
    expect(() => loginSchema.parse(invalidPayload)).toThrow(
      "Must be a valid username or email address",
    );
  });
});
