import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  Brain,
  Layers,
  Calendar,
  AlertTriangle,
  HeartHandshake,
  Activity,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { mockStageDistressData, mockPopulationDistressTrend30D } from '../data/mockData';

export const DistressAnalyticsPage: React.FC = () => {
  const [selectedGranularity, setSelectedGranularity] = useState<'30D' | '90D' | '1Y'>('30D');

  // Hearing correlation data
  const trialHearingSpikeData = [
    { event: 'T-14d (Pre-Trial)', avgDistress: 48, anxietyLevel: 42, sleepDisruptionRate: 35 },
    { event: 'T-7d (Summons)', avgDistress: 61, anxietyLevel: 58, sleepDisruptionRate: 51 },
    { event: 'T-2d (Briefing)', avgDistress: 74, anxietyLevel: 79, sleepDisruptionRate: 68 },
    { event: 'Trial Day (Testimony)', avgDistress: 88, anxietyLevel: 92, sleepDisruptionRate: 85 },
    { event: 'T+3d (Post-Hearing)', avgDistress: 67, anxietyLevel: 62, sleepDisruptionRate: 59 },
    { event: 'T+14d (Counselling)', avgDistress: 49, anxietyLevel: 44, sleepDisruptionRate: 38 },
  ];

  // Multi-modal channel contribution
  const modalityContributionData = [
    { channel: 'Acoustic Voice Stress', contributionPercent: 32, precisionRate: '91.4%' },
    { channel: 'NLP Sentiment / Threat Keywords', contributionPercent: 28, precisionRate: '94.2%' },
    { channel: 'Engagement Velocity / Pulse Drop', contributionPercent: 22, precisionRate: '88.7%' },
    { channel: 'Case Stage Legal Milestone', contributionPercent: 18, precisionRate: '96.0%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h1 className="text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk']">
              Longitudinal Distress & Predictive Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Population-level mental health trajectories, legal milestone stress spikes, and intervention recovery velocity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200">
            Cohort: 1,284 Monitored Subjects
          </span>
        </div>
      </div>

      {/* Top 3 Analytical Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-indigo-900 text-white border border-indigo-800 shadow-xs space-y-1.5">
          <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
            Critical Milestone Vulnerability
          </span>
          <h3 className="text-xl font-bold font-['Space_Grotesk']">+39% Spike at Trial Hearings</h3>
          <p className="text-xs text-indigo-200 leading-relaxed">
            Distress scores peak during in-court cross-examination. Pre-trial counselling intervention reduces escalation by 44%.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xs space-y-1.5">
          <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
            Intervention Efficacy
          </span>
          <h3 className="text-xl font-bold font-['Space_Grotesk']">-18.4 pts in 14 Days</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Victims receiving combined Psychological Counselling and Witness Protection demonstrate fastest score normalization.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xs space-y-1.5">
          <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
            Early Warning Lead Time
          </span>
          <h3 className="text-xl font-bold font-['Space_Grotesk']">4.2 Days Lead Window</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Multi-modal acoustic tremor and pulse frequency drops precede critical crisis events by over 4 days.
          </p>
        </div>
      </div>

      {/* Primary Chart 1: Distress Scores Across Legal Stages */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Average Distress Score by Case Stage
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Illustrates that victim distress is not static—it evolves dynamically across FIR, Investigation, Trial, and Rehabilitation.
          </p>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockStageDistressData} margin={{ top: 15, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="stage" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="avgDistress" name="Average Distress Score" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
          <span><strong>Key Finding:</strong> Trial Hearings stage records highest strain (78/100), followed by Initial FIR Complaint (74/100).</span>
          <span className="font-semibold text-emerald-700">Rehabilitation stabilizes to 31/100</span>
        </div>
      </div>

      {/* Two Column Grid: Trial Hearing Stress Curve vs Multi-Modal Signal Weights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trial Hearing Stress Curve (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Anticipatory Stress Curve Surrounding Trial Hearings
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Longitudinal tracking reveals acute anticipatory anxiety 72 hours prior to testimony.
            </p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trialHearingSpikeData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="distressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="anxietyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="event" tick={{ fontSize: 9.5, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="avgDistress" name="Distress Score" stroke="#4f46e5" fill="url(#distressGrad)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="anxietyLevel" name="Anxiety Level" stroke="#f59e0b" fill="url(#anxietyGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Multi-modal feature weights (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Multi-Modal Signal Weight Attribution
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Explainable feature weighting distribution.
            </p>
          </div>

          <div className="space-y-3">
            {modalityContributionData.map((item) => (
              <div key={item.channel} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{item.channel}</span>
                  <span className="font-extrabold text-indigo-700 font-mono">{item.contributionPercent}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${item.contributionPercent * 2.5}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Advisory Feature Weight</span>
                  <span>Validation Precision: {item.precisionRate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
