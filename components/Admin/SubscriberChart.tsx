import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SubscriberChartProps {
  data: Array<{
    date: string;
    subscribers: number;
  }>;
}

const SubscriberChart: React.FC<SubscriberChartProps> = ({ data }) => {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip 
            labelFormatter={(label) => `날짜: ${label}`}
            formatter={(value) => [value, '구독자 수']}
          />
          <Line 
            type="monotone" 
            dataKey="subscribers" 
            stroke="#8884d8" 
            strokeWidth={2}
            dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SubscriberChart;