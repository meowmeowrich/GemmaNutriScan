import React from 'react';

interface ProgressBarProps {
  label: string;
  value: number;
  max?: number;
  unit?: string;
  colorClass?: string;
  delay?: number; // Animation delay in ms
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  value,
  max = 100,
  unit = '',
  colorClass = 'bg-brand-500',
  delay = 0
}) => {
  const [width, setWidth] = React.useState(0);
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(percentage);
    }, delay);
    return () => clearTimeout(timer);
  }, [percentage, delay]);

  return (
    <div className="mb-4 w-full">
      <div className="flex justify-between items-end mb-1">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <span className="text-xs font-mono text-slate-400">{value}{unit}</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${colorClass}`}
          style={{ width: `${width}%` }}
        ></div>
      </div>
    </div>
  );
};