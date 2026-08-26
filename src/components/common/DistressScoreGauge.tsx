import React from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { RiskBadge } from './RiskBadge';
import { RiskLevel } from '../../types';

interface DistressScoreGaugeProps {
  score: number; // 0 - 100
  previousScore?: number;
  baselineScore?: number;
  sevenDayChange?: number;
  thirtyDayChange?: number;
  riskLevel: RiskLevel;
  trendText?: string;
  showComparisonIndicators?: boolean;
}

export const DistressScoreGauge: React.FC<DistressScoreGaugeProps> = ({
  score,
  previousScore = 68,
  baselineScore = 39,
  sevenDayChange = 14,
  thirtyDayChange = 27,
  riskLevel,
  trendText = '↑ 14 points over the last 7 days',
  showComparisonIndicators = true,
}) => {
  // Score color logic
  const getScoreColor = (val: number) => {
    if (val >= 80) return 'text-rose-600';
    if (val >= 60) return 'text-amber-600';
    if (val >= 40) return 'text-yellow-600';
    return 'text-emerald-600';
  };

  const getProgressColor = (val: number) => {
    if (val >= 80) return 'bg-rose-500';
    if (val >= 60) return 'bg-amber-500';
    if (val >= 40) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs transition-all">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-600" />
          <h3 className="text-sm font-bold tracking-tight text-slate-800 uppercase">
            Dynamic Distress Score
          </h3>
        </div>
        <RiskBadge level={riskLevel} size="md" showPulse />
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className={`text-4xl font-extrabold tracking-tight ${getScoreColor(score)} font-['Space_Grotesk']`}>
          {score}
        </span>
        <span className="text-slate-400 text-lg font-semibold">/ 100</span>
        
        {sevenDayChange !== 0 && (
          <span
            className={`ml-auto inline-flex items-center text-xs font-bold px-2 py-0.5 rounded ${
              sevenDayChange > 0
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {sevenDayChange > 0 ? (
              <TrendingUp className="w-3.5 h-3.5 mr-1 text-rose-600" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            )}
            {sevenDayChange > 0 ? `+${sevenDayChange}` : sevenDayChange} (7d)
          </span>
        )}
      </div>

      <p className="text-xs font-medium text-slate-600 mb-3 flex items-center gap-1.5">
        {trendText}
      </p>

      {/* Visual meter bar */}
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-4 relative">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getProgressColor(score)}`}
          style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
        />
        {/* Baseline marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-700 z-10"
          style={{ left: `${baselineScore}%` }}
          title={`Intake Baseline: ${baselineScore}`}
        />
      </div>

      {showComparisonIndicators && (
        <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-center">
          <div className="bg-slate-50/80 rounded-lg p-2 border border-slate-100">
            <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">Current</span>
            <span className="text-base font-bold text-slate-800 font-['Space_Grotesk']">{score}</span>
          </div>
          <div className="bg-slate-50/80 rounded-lg p-2 border border-slate-100">
            <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">7-Day Δ</span>
            <span className="text-base font-bold text-rose-600 font-['Space_Grotesk']">
              {sevenDayChange >= 0 ? `+${sevenDayChange}` : sevenDayChange}
            </span>
          </div>
          <div className="bg-slate-50/80 rounded-lg p-2 border border-slate-100">
            <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">30-Day Δ</span>
            <span className="text-base font-bold text-rose-600 font-['Space_Grotesk']">
              {thirtyDayChange >= 0 ? `+${thirtyDayChange}` : thirtyDayChange}
            </span>
          </div>
          <div className="bg-slate-50/80 rounded-lg p-2 border border-slate-100">
            <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">Baseline</span>
            <span className="text-base font-bold text-slate-700 font-['Space_Grotesk']">{baselineScore}</span>
          </div>
        </div>
      )}

      <div className="mt-3.5 flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 text-[11px] text-slate-500 leading-relaxed">
        <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
        <span>Scores represent system-generated monitoring signals and are <strong>not a clinical diagnosis</strong>.</span>
      </div>
    </div>
  );
};
