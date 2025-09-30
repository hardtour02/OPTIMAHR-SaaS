import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface LineChartData {
  name: string;
  value: number;
}

interface LineChartComponentProps {
  data: LineChartData[];
  theme?: 'light' | 'dark';
  isAnimationActive?: boolean;
}

const CustomTooltip: React.FC<any & { theme?: 'light' | 'dark' }> = ({ active, payload, label, theme = 'dark' }) => {
    if (active && payload && payload.length) {
        const wrapperClass = theme === 'light' 
            ? "bg-white p-2 border border-neutral-border rounded-md shadow-lg"
            : "bg-surface p-2 border border-neutral-border rounded-md shadow-lg";
        const labelClass = "font-semibold text-on-surface";
        
        return (
            <div className={wrapperClass}>
                <p className={labelClass}>{`${label}`}</p>
                <p className="text-sm text-primary">{`Cantidad : ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

const LineChartComponent: React.FC<LineChartComponentProps> = ({ data, theme = 'dark', isAnimationActive }) => {
  const tickColor = theme === 'light' ? '#334155' : '#94a3b8';
  const gridColor = theme === 'light' ? '#e2e8f0' : 'rgb(var(--color-neutral-border))';
  const legendStyle = theme === 'light' ? { color: '#334155' } : { color: '#94a3b8' };
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        isAnimationActive={isAnimationActive}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="name" tick={{ fill: tickColor }} />
        <YAxis tick={{ fill: tickColor }} allowDecimals={false}/>
        <Tooltip content={<CustomTooltip theme={theme} />} cursor={{ stroke: 'rgb(var(--color-primary))', strokeWidth: 1, strokeDasharray: '3 3' }} />
        <Legend wrapperStyle={legendStyle} />
        <Line type="monotone" dataKey="value" stroke="rgb(var(--color-primary))" strokeWidth={2} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;