import React from 'react';
import { Sparkles, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AiInsightCardProps {
  title?: string;
  summary: string;
  primarySignal?: string;
  actionText?: string;
  onActionClick?: () => void;
  variant?: 'warning' | 'critical' | 'info' | 'success';
  className?: string;
}

export const AiInsightCard: React.FC<AiInsightCardProps> = ({
  title = 'AI Insight',
  summary,
  primarySignal,
  actionText = 'View AI Reasoning',
  onActionClick,
  variant = 'warning',
  className = '',
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'critical':
        return {
          container: 'bg-rose-50/70 border-rose-200 text-slate-800',
          iconBadge: 'bg-rose-100 text-rose-700',
          badgeText: 'text-rose-700 font-bold',
          signalBg: 'bg-white/80 border-rose-200/80',
          btn: 'bg-rose-600 text-white hover:bg-rose-700',
        };
      case 'info':
        return {
          container: 'bg-indigo-50/60 border-indigo-200 text-slate-800',
          iconBadge: 'bg-indigo-100 text-indigo-700',
          badgeText: 'text-indigo-700 font-bold',
          signalBg: 'bg-white/80 border-indigo-200/80',
          btn: 'bg-indigo-600 text-white hover:bg-indigo-700',
        };
      case 'success':
        return {
          container: 'bg-emerald-50/60 border-emerald-200 text-slate-800',
          iconBadge: 'bg-emerald-100 text-emerald-700',
          badgeText: 'text-emerald-700 font-bold',
          signalBg: 'bg-white/80 border-emerald-200/80',
          btn: 'bg-emerald-700 text-white hover:bg-emerald-800',
        };
      case 'warning':
      default:
        return {
          container: 'bg-amber-50/70 border-amber-200 text-slate-800',
          iconBadge: 'bg-amber-100 text-amber-800',
          badgeText: 'text-amber-800 font-bold',
          signalBg: 'bg-white/80 border-amber-200/80',
          btn: 'bg-amber-700 text-white hover:bg-amber-800',
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`rounded-xl border p-4 shadow-xs relative overflow-hidden transition-all ${styles.container} ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className={`p-1.5 rounded-lg ${styles.iconBadge}`}>
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <h4 className={`text-xs uppercase tracking-wider ${styles.badgeText}`}>{title}</h4>
        </div>
        <span className="text-[11px] font-medium text-slate-500 bg-white/70 px-2 py-0.5 rounded border border-slate-200/60">
          Advisory Signal
        </span>
      </div>

      <p className="text-xs text-slate-800 font-medium leading-relaxed mb-3">{summary}</p>

      {primarySignal && (
        <div className={`p-2.5 rounded-lg border text-xs mb-3.5 ${styles.signalBg}`}>
          <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
            Primary Contributing Signal
          </span>
          <span className="font-semibold text-slate-900">{primarySignal}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
        <span className="text-slate-500 italic">Human review recommended.</span>
        {onActionClick && (
          <button
            onClick={onActionClick}
            type="button"
            className="inline-flex items-center gap-1 font-semibold text-indigo-700 hover:text-indigo-900 transition-colors cursor-pointer group"
          >
            {actionText}
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
};
