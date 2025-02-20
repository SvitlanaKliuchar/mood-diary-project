import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const MoodCounts = ({ moodCounts }) => {

  const moodColors = {
    great: "#6EC6FF", 
    good: "#58D68D", 
    meh: "#D5D8DC", 
    bad: "#E59866", 
    awful: "#D9534F"
};
  
  const moodOrder = ["great", "good", "meh", "bad", "awful"];

  const processedData = Object.entries(moodCounts).map(([mood, count]) => ({
    name: mood,
    value: count,
    color: moodColors[mood]
  }))
  .sort((a, b) => moodOrder.indexOf(a.name) - moodOrder.indexOf(b.name));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={processedData}
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default MoodCounts;
