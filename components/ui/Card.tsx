
import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string;
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, value, icon, colorClass, children }) => {
  return (
    <div className="bg-surface p-6 rounded-lg shadow-lg border border-neutral-border flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-on-surface-variant">{title}</p>
          <p className="text-3xl font-bold text-on-surface">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClass}`}>
          {icon}
        </div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default Card;