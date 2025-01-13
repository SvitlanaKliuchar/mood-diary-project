import React from 'react';
import styles from './Landing.module.css'

const FeatureCards = () => {
  return (
    <section id={styles['feature-cards']}>
        <div className={styles.feature}>
            <h2>Custom Mood Journals</h2>
            <article>With our web app, tracking your emotions and life moments has never been easier! Effortlessly record your moods, experiences, and habits with a few simple clicks, right from your browser. Start by selecting emojis that reflect your feelings, then dive deeper into detailed fields like sleep, health, and productivity. Over time, you’ll discover patterns that reveal what brings you joy and what might need adjustment. Your custom mood journal is always accessible, making it a perfect companion for your well-being journey.</article>
        </div>
        <div className={styles.feature}>
            <h2>Timely Reminders and Practical Insights</h2>
            <article>Stay organized and motivated with features that support your consistency. From gentle reminders to log your mood to curated quotes for daily inspiration, the app is designed to integrate seamlessly into your routine. The personalized calendar view provides a clear overview of your progress, enabling you to reflect on your journey and measure your achievements. With every interaction, the platform aims to guide you toward greater self-awareness and sustained improvement.</article>
        </div>
        <div className={styles.feature}>
            <h2>Intelligent Analysis with NLP</h2>
            <article>Harness the power of natural language processing (NLP) to uncover deeper insights from your entries. By analyzing your notes, the app identifies recurring themes, emotional trends, and connections between your habits and well-being. These intelligent insights provide actionable feedback, empowering you to make informed decisions and refine your approach to personal development. It’s like having a smart, analytical companion for your journey.</article>
        </div>
        <div className={styles.feature}>
            <h2>Generative Art as Emotional Expression</h2>
            <article>Transform your mood data into stunning, abstract art that visually represents your emotional journey. The system translates your moods into dynamic visuals: harmonious, flowing designs for stability and softer emotions, or bold, angular forms during more turbulent periods. Each piece is crafted using a unique palette and texture, offering a tangible reflection of your emotional landscape. It’s an innovative way to turn self-reflection into creative expression.</article>
        </div>
    </section>
  );
};

export default FeatureCards;