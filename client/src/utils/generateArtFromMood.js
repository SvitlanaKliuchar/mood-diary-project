import { moodConfigs, emotionModifiers } from "../data/gen-art";

export const generateArtFromMood = (moodEntries) => {
    return moodEntries.map((entry) => {
        //map runs the function you write on every item in order
        const base = moodConfigs[entry.mood] || moodConfigs["meh"]
        const emotionMods = (entry.emotions || []).map(
            (emotion) => emotionModifiers[emotion] || {}
        )

        return {
            shape: base.shape,
            color: base.color,
            speed: base.speed,
            complexity: base.complexity,
            particles: emotionMods.map((mod) => mod.particles),
            animations: emotionMods.map((mod) => mod.animation),
            date: entry.date,
            note: entry.note || "",
        }

    })
}