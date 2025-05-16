import React from 'react';
import styles from "../MoodDashboard.module.css";


const GenerateArtButton = () => {
    return (
        <>
            <p className={styles['gen-art-subtext']}>Transform your mood data into a unique piece of generative art!</p>
            <button className={styles['gen-art-btn']}>Generate Art Piece</button>
        </>
    );
};

export default GenerateArtButton;