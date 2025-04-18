import React from "react";
import styles from "./Landing.module.css";

const Hero = () => {
  return (
    <section id={styles.hero}>
      <div className={styles["hero-content"]}>
        <h1>Your Path to Emotional Clarity Starts Here</h1>
        <p>
          Track your emotions, set goals, and gain insights to build healthy
          habits and improve your mental health every day.
        </p>
      </div>
      <div className={styles["cta-buttons"]}>
        <a href="/login" className={`${styles.btn} ${styles["btn-primary"]}`}>
          Start Tracking
        </a>
        <a href="/login" className={`${styles.btn} ${styles["btn-secondary"]}`}>
          Why Track?
        </a>
      </div>
      <div>
      <h1>Generative Art Test</h1>
      <GenerativeArt moodLogs={mockMoodLogs} />
    </div>
    </section>
  );
};

export default Hero;
