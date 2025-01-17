import { describe, it, expect } from "vitest";
import { createMoodSchema, getMoodsQuerySchema } from "./moods-validation";

describe("Mood Validation", () => {
  it("should validate a correct mood payload", () => {
    const validPayload = {
      date: "2024-12-15",
      mood: "happy",
      note: "had a great date",
    };
    expect(() => createMoodSchema.parse(validPayload)).not.toThrow();
  });
  it("should reject a mood payload with an invalid date", () => {
    const invalidPayload = { date: "invalid-date", mood: "happy" };
    expect(() => createMoodSchema.parse(invalidPayload)).toThrow(
      "Invalid date",
    );
  });
  it("should reject a mood payload with an empty mood field", () => {
    const invalidPayload = { date: "2024-12-15", mood: "" };
    expect(() => createMoodSchema.parse(invalidPayload)).toThrow(
      "Mood cannot be empty",
    );
  });
  it("should validate a correct mood query with a date", () => {
    const validQuery = { date: "2024-12-15" };
    expect(() => getMoodsQuerySchema.parse(validQuery)).not.toThrow();
  });
  it("should reject a query with an invalid date format", () => {
    const invalidQuery = { date: "invalid-date" };
    expect(() => getMoodsQuerySchema.parse(invalidQuery)).toThrow(
      "Invalid date",
    );
  });
});
