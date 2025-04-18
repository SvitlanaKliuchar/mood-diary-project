import { describe, it, expect } from "vitest";
import { generateArtFromMood } from "./generateArtFromMood";

describe("generateArtFromMood", () => {
  it("returns consistent visual config from mood logs", () => {
    const mockMoodLogs = [
        {
          id: 1,
          date: new Date("2025-04-16"),
          mood: "great",
          emotions: ["happy", "grateful"],
          sleep: [],
          productivity: [],
          note: "Best day ever",
          photoUrl: null,
          user_id: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          date: new Date("2025-04-15"),
          mood: "bad",
          emotions: ["anxious", "stressed"],
          sleep: [],
          productivity: [],
          note: "Rough morning",
          photoUrl: null,
          user_id: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

    const result = generateArtFromMood(mockMoodLogs);

    expect(result[0].shape).toBe("bubble");
    expect(result[0].color).toBe("#6EC6FF");
    expect(result[0].particles).toEqual(["halo", "lightBeams"]);
    expect(result[1].animations).toEqual(["twistRapidly", "vibrate"]);
  });
});
