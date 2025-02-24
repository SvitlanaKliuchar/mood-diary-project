const MoodStability = ({ stabilityScore }) => {
  return (
    <>
      <div>{stabilityScore.toFixed(1)}%</div>
    </>
  );
};

export default MoodStability;
