import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import moods from "../../../data/moods.js";

const MoodCounts = ({ moodCounts }) => {
  const moodColors = {
    great: moods[0].color,
    good: moods[1].color,
    meh: moods[2].color,
    bad: moods[3].color,
    awful: moods[4].color,
  };
  const moodOrder = ["great", "good", "meh", "bad", "awful"];

  const processedData = Object.entries(moodCounts)
    .map(([mood, count]) => ({
      name: mood,
      value: count,
      color: moodColors[mood],
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
