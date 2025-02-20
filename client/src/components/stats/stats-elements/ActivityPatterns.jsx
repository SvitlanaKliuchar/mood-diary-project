import { useState, useEffect } from 'react';
import styles from '../MoodDashboard.module.css'
import moods from "../../../data/moods.js"
import emotionsOptions from "../../../data/emotions.js"
import productivityOptions from "../../../data/productivity.js"
import sleepOptions from "../../../data/sleep.js"

const ActivityPatterns = ({ activityPatterns }) => {
    const moodOrder = ["great", "good", "meh", "bad", "awful"];
    const validMoods = Object.keys(activityPatterns).sort((a, b) =>
        moodOrder.indexOf(a) - moodOrder.indexOf(b)
    );
    const defaultMood = validMoods.includes("good") ? "good" : validMoods[0] || "";
    const [selectedMood, setSelectedMood] = useState(defaultMood)

    //ensure selected mood updates once activityPatterns is ready
    useEffect(() => {
        if (validMoods.length > 0) {
            setSelectedMood(validMoods.includes("good") ? "good" : validMoods[0]);
        }
    }, [activityPatterns]); //rerun when activityPatterns changes

    //helper function to find icon URL for an activity
    const findActivityIcon = (activity) => {
        const allActivityOptions = [
            ...emotionsOptions,
            ...productivityOptions,
            ...sleepOptions
        ]
        return allActivityOptions.find(option =>
            option.value.toLowerCase() === activity.toLowerCase()
        )?.iconUrl
    }

    //helper function to find mood icon
    const findMoodIcon = (moodValue) => {
        return moods.find(mood => mood.value === moodValue)?.iconUrl
    }

    return (
        <>
            <div className={styles['select-mood-icon']}>
                <select
                    name="mood-select"
                    id="mood-select"
                    value={selectedMood}
                    onChange={(e) => setSelectedMood(e.target.value)}
                    aria-label="Select a mood"
                    className={styles['select-mood']}
                >
                    {validMoods.map((mood) => (
                        <option key={mood} value={mood}>
                            {mood}
                        </option>
                    )
                    )}

                </select>
                <img className={styles['mood-icon']} src={findMoodIcon(selectedMood)} alt="" />
            </div>

            {selectedMood && activityPatterns[selectedMood]?.length > 0 ? (
                <>
                    <div className={styles['often-together-container']}>
                        <h3>Often Together</h3>
                        <div className={styles['activity-patterns-container']}>
                            {activityPatterns[selectedMood].map((item, index) => {
                                const activityIcon = findActivityIcon(item.activity)
                                return (
                                    <div key={index} className={styles['activity-count']}>
                                        {activityIcon && (
                                            <img src={activityIcon} alt="" className={styles['activity-icon']} />
                                        )}
                                        <span className={styles.activity}>
                                            {item.activity}
                                        </span>
                                        <span className={styles.count}>
                                            ({item.count}x)
                                        </span>
                                    </div>
                                )
                            }
                            )}
                        </div>
                    </div>
                </>
            ) : selectedMood ? (<>
                <p>No common activities found for this mood.</p>
            </>
            ) : null}
        </>
    );
};

export default ActivityPatterns;