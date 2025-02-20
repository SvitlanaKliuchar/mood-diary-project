import styles from "../MoodDashboard.module.css";

const Streak = ({ streak }) => {
  return (
    <>
      <h3>Days in a Row</h3>
      <div className={styles["progress-indicator"]}>
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className={`${styles.circle} ${
              index >= 5 - streak ? styles["circle-active"] : ""
            }`}
          >
            {index >= 5 - streak ? (
              <span className={styles.check}>✔</span>
            ) : (
              <span className={styles.plus}>+</span>
            )}
          </div>
        ))}
        <div className={styles["streak-count"]}>{streak}</div>
      </div>
    </>
  );
};

export default Streak;
