import { RadialBarChart, RadialBar, Legend } from 'recharts';

import React from 'react';

const MoodStability = ({ stabilityScore }) => {
    const data = [
        {
            name: 'Mood Stability',
            value: stabilityScore,
            fill: '#8884d8',
        },
    ];
    return (
        <>
            <RadialBarChart
                width={300}
                height={300}
                cx={150}
                cy={150}
                innerRadius={50}
                outerRadius={140}
                barSize={10}
                data={data}
                startAngle={180}
                endAngle={0}
            >
                <RadialBar
                    minAngle={15}
                    clockWise
                    dataKey="value"
                />
                <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0 }} />
            </RadialBarChart></>
    );
};

export default MoodStability;