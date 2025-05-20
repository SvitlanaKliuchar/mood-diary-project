import moods from "../data/moods.js";

export const getMoodByValue = (value) => moods.find((m) => m.value === value);

export const getMoodByNumber = (number) =>
  moods.find((m) => m.number === number);

export const getMoodColor = (value) => getMoodByValue(value)?.color || "#ccc";

export const getMoodLabel = (value) => getMoodByValue(value)?.label || value;
