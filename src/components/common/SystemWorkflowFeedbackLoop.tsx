import React from 'react';
import {
  Users,
  Activity,
  Brain,
  TrendingUp,
  AlertTriangle,
  FileCheck2,
  HeartHandshake,
  Target,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

export const SystemWorkflowFeedbackLoop: React.FC<{ activeStepIndex?: number; className?: string }> = ({
  activeStepIndex = 3,
  className = '',
}) => {
  const steps = [
    { label: 'Victim / Witness', icon: Users, desc: 'Protected continuous interaction channels' },
    { label: 'Continuous Interactions', icon: Activity, desc: 'Text + Voice + Behaviour + Frequency' },
    { label: 'Dynamic Distress Score', icon: Brain, desc: 'Multi-modal weighted baseline tracking' },
    { label: 'Longitudinal Trend Analysis', icon: TrendingUp, desc: '7D/30D velocity vs single assessments' },
    { label: 'Risk Escalation Prediction', icon: AlertTriangle, desc: 'Early warning anomaly detection' },
    { label: 'Explainable AI Alert', icon: FileCheck2, desc: 'Transparent factor attribution (+18, +14)' },
    { label: 'Authorized Human Review', icon: Users, desc: 'Mandatory verification by Officer/Counsellor' },
    { label: 'Targeted Intervention', icon: HeartHandshake, desc: 'Protection, Counselling, Legal, Medical' },
    { label: 'Outcome Tracking', icon: Target, desc: 'Post-intervention distress reassessment' },
    { label: 'Continuous Loop', icon: RefreshCw, desc: 'Life-cycle case monitoring & rehabilitation' },
  ];

  return (
    <div className={`bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-md ${className}`}>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-300">
              Continuous Wellbeing Monitoring & Closed-Loop Intervention Architecture
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            PS-26094: End-to-end flow from multi-modal signals to explainable early escalation alerts and verified human outcome tracking.
          </p>
        </div>
        <span className="hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          MoSJE System Flow
        </span>
      </div>

      {/* Horizontal scrollable on smaller screens / wrapping grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCurrent = idx === activeStepIndex;
          const isPassed = idx < activeStepIndex;

          return (
            <div
              key={step.label}
              className={`p-2.5 rounded-lg border text-center transition-all flex flex-col justify-between items-center relative ${
                isCurrent
                  ? 'bg-indigo-600/30 border-indigo-400 ring-2 ring-indigo-500/50 shadow-inner'
                  : isPassed
                  ? 'bg-slate-800/80 border-slate-700/80'
                  : 'bg-slate-800/40 border-slate-800 opacity-75'
              }`}
            >
              <div className="flex items-center justify-center w-full mb-1.5">
                <span
                  className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                    isCurrent
                      ? 'bg-indigo-400 text-slate-950 font-extrabold'
                      : isPassed
                      ? 'bg-emerald-400 text-slate-950 font-bold'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {idx + 1}
                </span>
              </div>

              <div
                className={`p-2 rounded-full mb-1.5 ${
                  isCurrent ? 'bg-indigo-500 text-white' : 'bg-slate-700/60 text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>

              <h4 className="text-[11px] font-bold text-slate-200 leading-tight mb-1">{step.label}</h4>
              <p className="text-[9px] text-slate-400 line-clamp-2 leading-tight">{step.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
