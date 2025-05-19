import styles from "../MoodDashboard.module.css";

const GenerateArtButton = ({ locked = false, onClick }) => (
  <>
    <p className={styles['gen-art-subtext']}>
      Transform your mood data into a unique piece of generative art!
    </p>
    <button
      className={styles['gen-art-btn']}
      disabled={locked}
      aria-disabled={locked}
      style={locked ? { pointerEvents: "none" } : undefined}
      onClick={onClick} 
    >
      Generate Art Piece
    </button>
  </>
);


export default GenerateArtButton;
