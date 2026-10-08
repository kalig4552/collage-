import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  badge?: string;
  variant?: 'default' | 'danger' | 'success' | 'warning' | 'indigo';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  badge,
  variant = 'default',
}) => {
  const variantStyles = {
    default: {
      border: 'border-slate-800',
      iconBg: 'bg-slate-800 text-slate-300',
      valueColor: 'text-slate-100',
    },
    indigo: {
      border: 'border-indigo-900/40',
      iconBg: 'bg-indigo-500/10 text-indigo-400',
      valueColor: 'text-indigo-400',
    },
    success: {
      border: 'border-emerald-900/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      valueColor: 'text-emerald-400',
    },
    warning: {
      border: 'border-amber-900/40',
      iconBg: 'bg-amber-500/10 text-amber-400',
      valueColor: 'text-amber-400',
    },
    danger: {
      border: 'border-rose-900/40',
      iconBg: 'bg-rose-500/10 text-rose-400',
      valueColor: 'text-rose-400',
    },
  }[variant];

  return (
    <div
      className={`bg-slate-900/80 backdrop-blur-sm border ${variantStyles.border} rounded-xl p-4 transition-all duration-200 hover:border-slate-700 hover:shadow-lg`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-400 tracking-wider uppercase">{title}</span>
        <div className={`p-2 rounded-lg ${variantStyles.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold font-mono tracking-tight ${variantStyles.valueColor}`}>
          {value}
        </span>
        {badge && (
          <span className="text-[11px] font-medium text-slate-400">
            {badge}
          </span>
        )}
      </div>
      {subtext && <p className="text-xs text-slate-400 mt-1.5">{subtext}</p>}
    </div>
  );
};
