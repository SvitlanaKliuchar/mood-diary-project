import { useContext, useEffect, useState, useRef } from "react";
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
import GenArtWrapper from "../gen-art/GenArtWrapper.jsx";
import { useLocation } from "react-router-dom";
import footerStarImage from "../../assets/images/footer-star.png";

const MoodDashboard = () => {
  const [streak, setStreak] = useState(0);
  const [moodChartData, setMoodChartData] = useState([]);
  const [moodCounts, setMoodCounts] = useState({});
  const [stabilityScore, setStabilityScore] = useState(100);
  const [activityPatterns, setActivityPatterns] = useState([]);
  const [dayOfWeekAvg, setDayOfWeekAvg] = useState({});
  const [productivityCorrelation, setProductivityCorrelation] = useState(0);
  const [wordCloudData, setWordCloudData] = useState([]);
  const [moodWordAssociations, setMoodWordAssociations] = useState({});
  const [entryCount, setEntryCount] = useState(0);
  const [showArt, setShowArt] = useState(false);
  const [moodLogs, setMoodLogs] = useState([]);

  const location = useLocation();
  const genArtSectionRef = useRef(null);

  const { user } = useContext(AuthContext);
  const { startLoading, finishLoading } = useContext(LoadingContext);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
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
        setWordCloudData(data.wordCloudData);
        setMoodWordAssociations(data.moodWordAssociations);
        setEntryCount(data.moodChartData.length);

        // fetch mood logs
        const moodRes = await axiosInstance.get(`/moods`);
        const normalized = moodRes.data.map((e) => ({
          ...e,
          date:
            typeof e.date === "string"
              ? e.date
              : new Date(e.date).toISOString().slice(0, 10),
        }));
        setMoodLogs(normalized);

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

  useEffect(() => {
    if (location.hash === "#gen-art-section" && genArtSectionRef.current) {
      setTimeout(() => {
        genArtSectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300); // wait a bit in case data or DOM isn't ready yet
    }
  }, [location.hash]);

  const handleGenerateArtClick = () => {
    setShowArt(true);

    // Use the global function instead of attributes
    setTimeout(() => {
      if (window.startArtGeneration) {
        window.startArtGeneration();
      }
    }, 300);
  };

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
        <div className={`${styles["word-cloud"]} ${styles["dashboard-item"]}`}>
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
          ref={genArtSectionRef}
        >
          <img
            className={styles["sparkle-left"]}
            src={footerStarImage}
            alt=""
          />
          <img
            className={styles["sparkle-right"]}
            src={footerStarImage}
            alt=""
          />
          <h3 className={styles["gen-art-heading"]}>
            You've unlocked something special
          </h3>
          {/* overlay if fewer than 5 entries */}
          {entryCount < 5 && (
            <div className={styles["gen-art-lock"]}>
              <span className={styles["lock-icon"]} aria-hidden="true">
                🔒
              </span>
              <p className={styles["lock-text"]}>
                Unlocks after{5 - entryCount} more{" "}
                {5 - entryCount === 1 ? "entry" : "entries"}
              </p>
            </div>
          )}
          <GenerateArtButton
            locked={entryCount < 5}
            onClick={handleGenerateArtClick}
          />
        </div>
        {showArt && (
          <div
            id="genArtWrapper"
            className={`${styles["gen-art-preview"]} ${styles["dashboard-item"]}`}
          >
            <GenArtWrapper />
          </div>
        )}

        {!showArt && (
          <p className={styles["dashboard-text"]}>
            Keep up the good work! The more entries we have to analyze, the more
            insightful the stats data will be for you.
          </p>
        )}
      </div>
    </div>
  );
};

export default MoodDashboard;
