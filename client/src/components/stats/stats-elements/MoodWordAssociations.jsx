import { useState, useEffect } from 'react';
import styles from '../MoodDashboard.module.css'
import moods from '../../../data/moods.js';

const MoodWordAssociations = ({ moodWordAssociations }) => {
    const moodOrder = ["great", "good", "meh", "bad", "awful"];
    const validMoods = Object.keys(moodWordAssociations || {}).sort(
        (a, b) => moodOrder.indexOf(a) - moodOrder.indexOf(b)
    );

    const defaultMood = validMoods.includes("good")
        ? "good"
        : validMoods[0] || "";

    const [selectedMood, setSelectedMood] = useState(defaultMood);
    const [view, setView] = useState("words");

    //ensure selected mood updates once moodWordAssociations is ready
    useEffect(() => {
        if (validMoods.length > 0) {
            setSelectedMood(validMoods.includes("good") ? "good" : validMoods[0]);
        }
    }, [moodWordAssociations]);

    const findMoodIcon = (moodValue) => {
        return moods.find((mood) => mood.value === moodValue)?.iconUrl;
    };

    //helper function to get color based on TFIDF score
    const getWordColor = (tfidf) => {
        //find the max TFIDF in the current mood's words
        const currentMoodWords = moodWordAssociations[selectedMood]?.words || [];
        const maxTfidf = currentMoodWords.length ?
            Math.max(...currentMoodWords.map(w => w.tfidf)) : 1;

        //normalize the score (0-1)
        const normalizedScore = Math.min(1, tfidf / maxTfidf);

        //use color based on mood
        let baseColor;
        switch (selectedMood) {
            case 'great': baseColor = [0, 128, 0]; break;
            case 'good': baseColor = [144, 238, 144]; break;
            case 'meh': baseColor = [255, 215, 0]; break; 
            case 'bad': baseColor = [255, 165, 0]; break; 
            case 'awful': baseColor = [255, 69, 0]; break; 
            default: baseColor = [100, 100, 100];
        }

        //adjust intensity based on score
        const adjustedColor = baseColor.map(c => Math.round(c * normalizedScore));
        return `rgb(${adjustedColor[0]}, ${adjustedColor[1]}, ${adjustedColor[2]})`;
    };

    //get font size based on frequency
    const getFontSize = (value, maxValue) => {
        const minFontSize = 0.8;
        const maxFontSize = 1.5;
        const normalized = value / maxValue;
        return minFontSize + normalized * (maxFontSize - minFontSize);
    };

    //helper to get word size for display
    const getWordStyle = (word) => {
        const currentMoodWords = moodWordAssociations[selectedMood]?.words || [];
        const maxValue = currentMoodWords.length ?
            Math.max(...currentMoodWords.map(w => w.value)) : 1;

        return {
            fontSize: `${getFontSize(word.value, maxValue)}rem`,
            color: getWordColor(word.tfidf),
            fontWeight: word.tfidf > 0.5 ? "bold" : "normal",
            margin: "0.2rem 0.4rem",
            padding: "0.2rem",
            display: "inline-block"
        };
    };
    return (
        <>
            <div className={styles["mood-word-controls"]}>
                <div className={styles["select-mood-icon"]}>
                    <select
                        name="mood-select"
                        id="mood-select"
                        value={selectedMood}
                        onChange={(e) => setSelectedMood(e.target.value)}
                        aria-label="Select a mood"
                        className={styles["select-mood"]}
                    >
                        {validMoods.map((mood) => (
                            <option key={mood} value={mood}>
                                {mood}
                            </option>
                        ))}
                    </select>
                    <img
                        className={styles["mood-icon-2"]}
                        src={findMoodIcon(selectedMood)}
                        alt=""
                    />
                </div>

                <div className={styles["view-toggle"]}>
                    <button
                        className={`${styles["view-button"]} ${view === "words" ? styles["view-button-active"] : ""}`}
                        onClick={() => setView("words")}
                    >
                        Words
                    </button>
                    <button
                        className={`${styles["view-button"]} ${view === "pairs" ? styles["view-button-active"] : ""}`}
                        onClick={() => setView("pairs")}
                    >
                        Word Pairs
                    </button>
                </div>
            </div>

            {selectedMood && moodWordAssociations && moodWordAssociations[selectedMood] ? (
                view === "words" ? (
                    <div className={styles["mood-words-container"]}>
                        <h4>Words Associated with <span className={styles["mood-title"]}>{selectedMood}</span> Mood</h4>
                        <div className={styles["word-cloud-inline"]}>
                            {moodWordAssociations[selectedMood].words.map((word, idx) => (
                                <span
                                    key={idx}
                                    style={getWordStyle(word)}
                                    title={`Frequency: ${word.value}, Uniqueness: ${word.tfidf.toFixed(2)}`}
                                >
                                    {word.text}
                                </span>
                            ))}
                        </div>
                        <div className={styles["word-legend"]}>
                            <p>Larger words = more frequent. More vibrant colors = more distinctive to this mood.</p>
                        </div>
                    </div>
                ) : (
                    <div className={styles["word-pairs-container"]}>
                        <h4>Word Pairs in <span className={styles["mood-title"]}>{selectedMood}</span> Mood</h4>
                        <div className={styles["word-pairs-list"]}>
                            {moodWordAssociations[selectedMood].coOccurring.map((pair, idx) => (
                                <div key={idx} className={styles["word-pair-item"]}>
                                    <div className={styles["word-pair"]}>
                                        <span className={styles["pair-word"]}>{pair.words[0]}</span>
                                        <span className={styles["pair-connector"]}>+</span>
                                        <span className={styles["pair-word"]}>{pair.words[1]}</span>
                                    </div>
                                    <div className={styles["pair-count"]}>
                                        {pair.count}x
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className={styles["word-legend"]}>
                            <p>These words frequently appear close together in your notes.</p>
                        </div>
                    </div>
                )
            ) : (
                <div className={styles["no-data"]}>
                    <p>No word data available for {selectedMood} mood.</p>
                    <p>Try adding more detailed notes to your mood entries.</p>
                </div>
            )}
        </>
    );
};

export default MoodWordAssociations;