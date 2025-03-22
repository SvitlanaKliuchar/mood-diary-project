import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MoodChart = ({ moodChartData }) => {
  const moodScale = {
    5: "great",
    4: "good",
    3: "meh",
    2: "bad",
    1: "awful",
  };

  const processedData = moodChartData.map((item) => ({
    date: new Date(item.date).toLocaleDateString(),
    mood: item.mood,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={processedData}
        margin={{ top: 10, right: 10, left: 30, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="date"
          tickMargin={10}
          stroke="#666"
          tick={{ fill: "#666" }}
        />
        <YAxis
          domain={[1, 5]}
          tickFormatter={(tick) => moodScale[tick]}
          tickMargin={10}
          stroke="#666"
          tick={{ fill: "#666" }}
          padding={{ top: 20, bottom: 20 }}
        />
        <Tooltip formatter={(value) => [moodScale[value], "mood"]} />
        <Line
          type="monotone"
          dataKey="mood"
          stroke="#8884d8"
          strokeWidth={2}
          dot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MoodChart;
