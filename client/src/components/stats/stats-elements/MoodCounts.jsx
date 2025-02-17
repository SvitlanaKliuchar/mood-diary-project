import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';


const MoodCounts = ({moodCounts}) => {
    const moodCountsArray = Object.entries(moodCounts).map(([mood, count]) => ({
        name: mood,
        value: count,
      }));


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']; 

  return (
    <>
    <PieChart width={400} height={400}>
  <Pie
    data={moodCountsArray}
    cx="50%"
    cy="50%"
    labelLine={false}
    label={({ name, value }) => `${name} (${value})`}
    outerRadius={100}
    fill="#8884d8"
    dataKey="value"
  >
    {moodCountsArray.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
    ))}
  </Pie>
  <Tooltip />
  <Legend />
</PieChart>
</>
  );
};

export default MoodCounts;