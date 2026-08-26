import React from 'react';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  trendText?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  trendPositiveIsGood?: boolean;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'indigo';
  onClick?: () => void;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  trendText,
  trendDirection = 'up',
  trendPositiveIsGood = false,
  subtitle,
  icon: Icon,
  variant = 'default',
  onClick,
  className = '',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          border: 'border-rose-200/80 hover:border-rose-400/80 bg-gradient-to-b from-white to-rose-50/20',
          iconBg: 'bg-rose-100 text-rose-700',
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
          highlight: 'text-rose-700',
          indicator: 'bg-rose-500',
        };
      case 'warning':
        return {
          border: 'border-amber-200/80 hover:border-amber-400/80 bg-gradient-to-b from-white to-amber-50/20',
          iconBg: 'bg-amber-100 text-amber-700',
          badge: 'bg-amber-50 text-amber-800 border-amber-200',
          highlight: 'text-amber-700',
          indicator: 'bg-amber-500',
        };
      case 'success':
        return {
          border: 'border-emerald-200/80 hover:border-emerald-400/80 bg-gradient-to-b from-white to-emerald-50/20',
          iconBg: 'bg-emerald-100 text-emerald-700',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          highlight: 'text-emerald-700',
          indicator: 'bg-emerald-500',
        };
      case 'indigo':
        return {
          border: 'border-indigo-200/80 hover:border-indigo-400/80 bg-gradient-to-b from-white to-indigo-50/20',
          iconBg: 'bg-indigo-100 text-indigo-700',
          badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          highlight: 'text-indigo-700',
          indicator: 'bg-indigo-500',
        };
      case 'default':
      default:
        return {
          border: 'border-slate-200/90 hover:border-slate-300 bg-white',
          iconBg: 'bg-slate-100 text-slate-700',
          badge: 'bg-slate-100 text-slate-700 border-slate-200',
          highlight: 'text-slate-900',
          indicator: 'bg-slate-400',
        };
    }
  };

  const styles = getVariantStyles();

  // For high-risk, trending up is bad (red), trending down is good (green)
  const isGood =
    trendDirection === 'up'
      ? trendPositiveIsGood
      : trendDirection === 'down'
      ? !trendPositiveIsGood
      : true;

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border p-4 sm:p-5 shadow-xs transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${styles.border} ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 group' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-xl transition-transform duration-200 ${styles.iconBg} ${onClick ? 'group-hover:scale-110' : ''}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-['Space_Grotesk'] ${styles.highlight}`}>
            {value}
          </span>

          {trendText && (
            <span
              className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                isGood
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {trendDirection === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
              {trendDirection === 'down' && <TrendingDown className="w-3 h-3 mr-1" />}
              {trendDirection === 'neutral' && <Minus className="w-3 h-3 mr-1" />}
              {trendText}
            </span>
          )}
        </div>

        {subtitle && <p className="text-[11px] text-slate-500 mt-2 font-medium">{subtitle}</p>}
      </div>
    </div>
  );
};
