import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface BarChartData {
  name: string;
  [key: string]: any;
}

interface BarChartComponentProps {
  data: BarChartData[];
  dataKey: string;
  fill: string;
  theme?: 'light' | 'dark';
  isAnimationActive?: boolean;
}

const COLORS = ['#1E88E5', '#43A047', '#FB8C00', '#E53935', '#64B5F6', '#8b5cf6', '#ec4899'];

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


const BarChartComponent: React.FC<BarChartComponentProps> = ({ data, dataKey, fill, theme = 'dark', isAnimationActive }) => {
  const tickColor = theme === 'light' ? '#334155' : '#94a3b8';
  const gridColor = theme === 'light' ? '#e2e8f0' : 'rgb(var(--color-neutral-border))';
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
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
        <YAxis tick={{ fill: tickColor }} allowDecimals={false} />
        <Tooltip content={<CustomTooltip theme={theme} />} cursor={{fill: 'rgba(30, 136, 229, 0.1)'}} />
        <Bar dataKey={dataKey} fill={fill} radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartComponent;