import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';


const DayOfWeekAvg = ({dayOfWeekAvg}) => {
    const dayOfWeekAvgArray = Object.entries(dayOfWeekAvg).map(([day, count]) => ({
        day,
        count
      }));
      
  return (
    <>
      <RadarChart 
  cx={300} 
  cy={250} 
  outerRadius={150} 
  width={600} 
  height={500} 
  data={dayOfWeekAvgArray}
>
  <PolarGrid />
  <PolarAngleAxis dataKey="day" />
  <PolarRadiusAxis angle={30} domain={[0, 10]} />
  <Radar 
    name="Avg Mood" 
    dataKey="count" 
    stroke="#8884d8" 
    fill="#8884d8" 
    fillOpacity={0.6} 
  />
  <Legend />
</RadarChart>
    </>
  );
};

export default DayOfWeekAvg;