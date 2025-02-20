import React from "react";
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';

const DayOfWeekAvg = ({ dayOfWeekAvg }) => {
  const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  //mood scale mapping
  const moodScale = {
    5: "great",
    4: "good",
    3: "meh",
    2: "bad",
    1: "awful"
  };

  //color mapping
  const moodColors = {
    great: "#6EC6FF", 
    good: "#58D68D", 
    meh: "#D5D8DC", 
    bad: "#E59866", 
    awful: "#D9534F"
};


  const processedData = dayOrder.map(day => ({
    day,
    average: dayOfWeekAvg[day] || 0,
    mood: moodScale[Math.round(dayOfWeekAvg[day] || 'meh')]
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={processedData}
        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e0e0e0"
        />
        <XAxis
          dataKey="day"
          tickMargin={10}
          stroke="#666"
          tick={{ fill: '#666' }}
        />
        <YAxis
          domain={[1, 5]}
          tickFormatter={(tick) => moodScale[tick]}
          tickMargin={10}
          stroke="#666"
          tick={{ fill: '#666' }}
      
        />
        <Tooltip
          formatter={(value) => [
            `${moodScale[Math.round(value)]} (${value.toFixed(1)})`,
            "mood"
          ]}
        />
        <Bar dataKey="average">
          {processedData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={moodColors[entry.mood]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DayOfWeekAvg;
