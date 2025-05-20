import { describe, it, expect, vi } from "vitest";
import {
  getMoodByValue,
  getMoodByNumber,
  getMoodColor,
  getMoodLabel,
} from "./moodUtils";

vi.mock("../data/moods", () => ({
  default: [
    { value: "great", label: "Great", color: "#6EC6FF", number: 5 },
    { value: "good", label: "Good", color: "#58D68D", number: 4 },
    { value: "meh", label: "Meh", color: "#D5D8DC", number: 3 },
    { value: "bad", label: "Bad", color: "#E59866", number: 2 },
    { value: "awful", label: "Awful", color: "#D9534F", number: 1 },
  ],
}));

describe("Mood Utilities", () => {
  describe("getMoodByValue", () => {
    it("returns the correct mood object when a valid value is provided", () => {
      const result = getMoodByValue("great");
      expect(result).toEqual({
        value: "great",
        label: "Great",
        color: "#6EC6FF",
        number: 5,
      });
    });

    it("returns undefined when the mood value does not exist", () => {
      const result = getMoodByValue("nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("getMoodByNumber", () => {
    it("returns the correct mood object when a valid number is provided", () => {
      const result = getMoodByNumber(4);
      expect(result).toEqual({
        value: "good",
        label: "Good",
        color: "#58D68D",
        number: 4,
      });
    });

    it("returns undefined when the mood number does not exist", () => {
      const result = getMoodByNumber(99);
      expect(result).toBeUndefined();
    });
  });

  describe("getMoodColor", () => {
    it("returns the correct color for a valid mood value", () => {
      const result = getMoodColor("bad");
      expect(result).toBe("#E59866");
    });

    it('returns "#ccc" fallback color when the mood value does not exist', () => {
      const result = getMoodColor("nonexistent");
      expect(result).toBe("#ccc");
    });
  });

  describe("getMoodLabel", () => {
    it("returns the correct label for a valid mood value", () => {
      const result = getMoodLabel("awful");
      expect(result).toBe("Awful");
    });

    it("returns the original value when the mood value does not exist", () => {
      const result = getMoodLabel("nonexistent");
      expect(result).toBe("nonexistent");
    });
  });
});
