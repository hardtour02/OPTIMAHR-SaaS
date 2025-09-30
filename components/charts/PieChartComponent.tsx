import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PieChartData {
  name: string;
  value: number;
}

interface PieChartComponentProps {
  data: PieChartData[];
  theme?: 'light' | 'dark';
  isAnimationActive?: boolean;
}

const COLORS = ['#1E88E5', '#43A047', '#FB8C00', '#E53935', '#64B5F6'];

const PieChartComponent: React.FC<PieChartComponentProps> = ({ data, theme = 'dark', isAnimationActive }) => {
  const tooltipStyle = theme === 'light'
    ? { backgroundColor: 'rgb(var(--color-surface))', borderColor: 'rgb(var(--color-neutral-border))', color: 'rgb(var(--color-on-surface))' }
    : { backgroundColor: 'rgb(var(--color-surface))', borderColor: 'rgb(var(--color-neutral-border))', color: 'rgb(var(--color-on-surface))' };
  
  const legendStyle = theme === 'light' ? { color: '#334155' } : { color: '#94a3b8' };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          isAnimationActive={isAnimationActive}
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltipStyle}
        />
        <Legend iconSize={10} wrapperStyle={legendStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartComponent;