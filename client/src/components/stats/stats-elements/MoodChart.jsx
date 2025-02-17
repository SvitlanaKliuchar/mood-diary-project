import styles from '../MoodDashboard.module.css'


const MoodChart = () => {
  return (
     <div className={`${styles['mood-chart']} ${styles['dashboard-item']}`}>
    
                            <h3>Mood Chart (Last 7 entries)</h3>
                            <ResponsiveContainer>
                                <BarChart
                                    data={moodChartData.map((item) => ({
                                        date: new Date(item.date).toLocaleDateString(),
                                        mood: item.mood
                                    }))}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis dataKey="mood" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="mood" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
  );
};

export default MoodChart;