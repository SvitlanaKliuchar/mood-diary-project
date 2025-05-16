import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import styles from "./MoodDashboard.module.css";
import axiosInstance from "../../utils/axiosInstance.js";
import { LoadingContext } from "../../contexts/LoadingContext.jsx";
import Streak from "./stats-elements/Streak.jsx";
import MoodChart from "./stats-elements/MoodChart.jsx";
import MoodCounts from "./stats-elements/MoodCounts.jsx";
import DayOfWeekAvg from "./stats-elements/DayOfWeekAvg.jsx";
import MoodStability from "./stats-elements/MoodStability.jsx";
import ProductivityScore from "./stats-elements/ProductivityCorrelation.jsx";
import ActivityPatterns from "./stats-elements/ActivityPatterns.jsx";
import WordCloud from "./stats-elements/WordCloud.jsx";
import MoodWordAssociations from "./stats-elements/MoodWordAssociations.jsx";
import GenerateArtButton from "./stats-elements/GenerateArtButton.jsx";

const MoodDashboard = () => {
  const [streak, setStreak] = useState(0);
  const [moodChartData, setMoodChartData] = useState([]);
  const [moodCounts, setMoodCounts] = useState({});
  const [stabilityScore, setStabilityScore] = useState(100);
  const [activityPatterns, setActivityPatterns] = useState([]);
  const [dayOfWeekAvg, setDayOfWeekAvg] = useState({});
  const [productivityCorrelation, setProductivityCorrelation] = useState(0);
  const [wordCloudData, setWordCloudData] = useState([])
  const [moodWordAssociations, setMoodWordAssociations] = useState({})

  const { user } = useContext(AuthContext);
  const { startLoading, finishLoading } = useContext(LoadingContext);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088fe"];

  useEffect(() => {
    if (!user?.id) return;
    //when fetching stats do :user.id
    const fetchStats = async () => {
      try {
        startLoading();
        const response = await axiosInstance.get(`/stats/${user.id}`);
        const data = response.data;
        console.log(data);

        //update the state with fetched data
        setStreak(data.streak);
        setMoodChartData(data.moodChartData);
        setMoodCounts(data.moodCounts);
        setStabilityScore(data.stabilityScore);
        setActivityPatterns(data.activityPatterns);
        setDayOfWeekAvg(data.dayOfWeekAverages);
        setProductivityCorrelation(data.productivityCorrelation);
        setWordCloudData(data.wordCloudData)
        setMoodWordAssociations(data.moodWordAssociations)
        setError(null);
      } catch (error) {
        console.error("Failed to fetch stats: ", error);
        setError("Failed to fetch stats");
      } finally {
        finishLoading();
      }
    };
    fetchStats();
  }, [user]);

  return (
    <div className={styles["dashboard-container"]}>
      <div className={styles["mood-dashboard"]}>
        <div
          className={`${styles["days-in-a-row"]} ${styles["dashboard-item"]}`}
        >
          <Streak streak={streak} />
        </div>
        <div
          className={`${styles["mood-stability"]} ${styles["dashboard-item"]}`}
        >
          <h3>Mood Stability</h3>
          <MoodStability stabilityScore={stabilityScore} />
        </div>
        <div className={`${styles["mood-chart"]} ${styles["dashboard-item"]}`}>
          <h3>Mood Trends</h3>
          <MoodChart moodChartData={moodChartData} />
        </div>
        <div
          className={`${styles["daily-mood-avg"]} ${styles["dashboard-item"]}`}
        >
          <h3>Daily Mood Averages</h3>
          <DayOfWeekAvg dayOfWeekAvg={dayOfWeekAvg} />
        </div>

        <div
          className={`${styles["mood-distribution"]} ${styles["dashboard-item"]}`}
        >
          <h3>Mood Distribution</h3>
          <MoodCounts moodCounts={moodCounts} />
        </div>

        <div
          className={`${styles["activity-patterns"]} ${styles["dashboard-item"]}`}
        >
          <h3>Activity Patterns</h3>
          <ActivityPatterns activityPatterns={activityPatterns} />
        </div>

        <div
          className={`${styles["productivity-impact"]} ${styles["dashboard-item"]}`}
        >
          <h3>Productivity Impact</h3>
          <ProductivityScore correlation={productivityCorrelation} />
        </div>
        <div
          className={`${styles["word-cloud"]} ${styles["dashboard-item"]}`}
        >
          <h3>Word Cloud</h3>
          <WordCloud data={wordCloudData} />
        </div>
        <div
          className={`${styles["mood-word-associations"]} ${styles["dashboard-item"]}`}
        >
          <h3>Mood Word Patterns</h3>
          <MoodWordAssociations moodWordAssociations={moodWordAssociations} />
        </div>
        <div
          className={`${styles["gen-art-section"]} ${styles["dashboard-item"]}`}
        >
          <img className={styles['sparkle-left']} src="src/assets/images/footer-star.png" alt="" />
          <img className={styles['sparkle-right']} src="src/assets/images/footer-star.png" alt="" />
          <h3>You've unlocked something special</h3>
          <GenerateArtButton />
        </div>

        <p className={styles['dashboard-text']}>
        Keep up the good work! The more entries we have to analyze, the more insightful the stats data will be for you.
        </p>
      </div>
    </div>
  );
};

export default MoodDashboard;
