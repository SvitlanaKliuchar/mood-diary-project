import GenerativeArt from "../gen-art/GenerativeArt";

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
  },
  {
    id: 3,
    date: new Date("2025-04-17"),
    mood: "good",
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
    id: 4,
    date: new Date("2025-04-18"),
    mood: "awful",
    emotions: ["anxious", "stressed"],
    sleep: [],
    productivity: [],
    note: "Rough morning",
    photoUrl: null,
    user_id: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 5,
    date: new Date("2025-04-19"),
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
    id: 6,
    date: new Date("2025-04-20"),
    mood: "awful",
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

export default function TestGenArt() {
    return (
      <div>
        <h1>Generative Art Test</h1>
        <GenerativeArt moodLogs={mockMoodLogs} />
      </div>
    );
  }