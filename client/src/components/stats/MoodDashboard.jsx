import { useContext, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { AuthContext } from '../../contexts/AuthContext';
import styles from './MoodDashboard.module.css'
import axiosInstance from '../../utils/axiosInstance.js';
import { LoadingContext } from '../../contexts/LoadingContext.jsx';
import { ResponsiveContainer } from 'recharts';
import Streak from './stats-elements/Streak.jsx';
import MoodChart from './stats-elements/MoodChart.jsx';
import DayOfWeekAvg from './stats-elements/DayOfWeekAvg.jsx';
import MoodStability from './stats-elements/MoodStability.jsx';

const MoodDashboard = () => {
    const [streak, setStreak] = useState(0)
    const [moodChartData, setMoodChartData] = useState([])
    const [moodCounts, setMoodCounts] = useState({})
    const [stabilityScore, setStabilityScore] = useState(100)
    const [activityPatterns, setActivityPatterns] = useState([])
    const [dayOfWeekAvg, setDayOfWeekAvg] = useState({})
    const [productivityCorrelation, setProductivityCorrelation] = useState(0)

    const { user } = useContext(AuthContext)
    const { startLoading, finishLoading } = useContext(LoadingContext)

    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)

    useEffect(() => {
        if (!user?.id) return;
        //when fetching stats do :user.id
        const fetchStats = async () => {
            try {
                startLoading()
                const response = await axiosInstance.get(`/stats/${user.id}`)
                const data = response.data
                console.log(data)

                //update the state with fetched data
                setStreak(data.streak);
                setMoodChartData(data.moodChartData);
                setMoodCounts(data.moodCounts);
                setStabilityScore(data.stabilityScore);
                setActivityPatterns(data.activityPatterns);
                setDayOfWeekAvg(data.dayOfWeekAverages)
                setProductivityCorrelation(data.productivityCorrelation)
                setError(null)
            } catch (error) {
                console.error("Failed to fetch stats: ", error)
                setError("Failed to fetch stats");
            } finally {
                finishLoading()
            }
        }
        fetchStats()
    }, [user])

    //convert mood counts to an array for display
    const moodCountsArray = Object.entries(moodCounts).map(([mood, count]) => ({ mood, count }))

    return (
        <div className={styles['dashboard-container']}>
            <div className={styles['mood-dashboard']}>
                <div className={styles['top-two-rows']}>
                    <Streak streak={streak} />

                </div>

                <div className={`${styles['day-of-week-avg']} ${styles['dashboard-item']}`}>
                    <ResponsiveContainer width={600} height="80%">
                        <DayOfWeekAvg dayOfWeekAvg={dayOfWeekAvg} />
                    </ResponsiveContainer>
                </div>

                <div className={`${styles['mood-stability']} ${styles['dashboard-item']}`}>
                    <MoodStability stabilityScore={stabilityScore} />
                </div>

                <div className={`${styles['activity-patterns']} ${styles['dashboard-item']}`}>
                    <h3>Activity Patterns</h3>
                    <ul>
                        {activityPatterns.map((pattern, idx) => (
                            <li key={idx}>
                                {pattern.activities.join(' & ')} - {pattern.count} times
                            </li>
                        ))}
                    </ul>
                </div>
                <div className={`${styles['mood-counts']} ${styles['dashboard-item']}`}>
                    <h3>Mood Counts</h3>
                    <div className={styles["circular-gauge"]} style={{ "--percent": 0.6 }}>
                        <div className={styles["gauge-bg"]}></div>
                        <div className={styles["gauge-fill"]}></div>
                        <div className={styles["gauge-value"]}>3</div>
                    </div>
                    <ul className={styles['mood-counts-list']}>
                        {moodCountsArray.map(({ mood, count }) => (
                            <li key={mood}>
                                {mood}: {count}
                            </li>
                        ))}

                    </ul>
                </div>
                <div className={`${styles['productivity-correlation']} ${styles['dashboard-item']}`}>
                    <h3>Productivity Correlation</h3>
                    <p>{productivityCorrelation}</p>
                </div>

            </div>
        </div>
    );
};

export default MoodDashboard;