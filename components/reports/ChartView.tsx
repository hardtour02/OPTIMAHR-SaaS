import React from 'react';
import { ReportChartType } from '../../types';
import BarChartComponent from '../charts/BarChartComponent';
import PieChartComponent from '../charts/PieChartComponent';
import LineChartComponent from '../charts/LineChartComponent';

interface ChartViewProps {
  chartType: ReportChartType;
  data: { name: string; value: number }[];
  theme?: 'light' | 'dark';
  isAnimationActive?: boolean;
}

const ChartView: React.FC<ChartViewProps> = ({ chartType, data, theme, isAnimationActive }) => {
    if (!data || data.length === 0) {
        return <p className="text-center text-on-surface-variant py-16">No hay suficientes datos para generar una gráfica.</p>;
    }

    switch (chartType) {
        case 'bar':
            return <BarChartComponent data={data} dataKey="value" fill="#4f46e5" theme={theme} isAnimationActive={isAnimationActive} />;
        case 'pie':
            return <PieChartComponent data={data} theme={theme} isAnimationActive={isAnimationActive} />;
        case 'line':
            return <LineChartComponent data={data} theme={theme} isAnimationActive={isAnimationActive} />;
        default:
            return <p>Tipo de gráfica no soportado.</p>;
    }
};

export default ChartView;