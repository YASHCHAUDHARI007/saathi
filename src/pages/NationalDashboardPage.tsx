import React from 'react';
import {
  Globe2,
  TrendingUp,
  ShieldCheck,
  Building,
  Award,
  Download,
  ExternalLink,
  Layers,
} from 'lucide-react';

export const NationalDashboardPage: React.FC = () => {
  const stateData = [
    { state: 'Maharashtra', activeCases: 1284, avgDistress: 56, highRiskRate: '11.0%', interventionRate: '94.2%' },
    { state: 'Uttar Pradesh', activeCases: 2150, avgDistress: 62, highRiskRate: '14.8%', interventionRate: '88.5%' },
    { state: 'Madhya Pradesh', activeCases: 1420, avgDistress: 59, highRiskRate: '12.4%', interventionRate: '91.0%' },
    { state: 'Rajasthan', activeCases: 1180, avgDistress: 58, highRiskRate: '13.1%', interventionRate: '89.6%' },
    { state: 'Bihar', activeCases: 1640, avgDistress: 64, highRiskRate: '16.2%', interventionRate: '86.4%' },
    { state: 'Tamil Nadu', activeCases: 890, avgDistress: 46, highRiskRate: '7.8%', interventionRate: '96.8%' },
    { state: 'Karnataka', activeCases: 760, avgDistress: 48, highRiskRate: '8.4%', interventionRate: '95.1%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-indigo-600" />
            <h1 className="text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk']">
              National Atrocity Victim Wellbeing Intelligence
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            MoSJE Department of Social Justice and Empowerment • Pan-India Executive Oversight.
          </p>
        </div>

        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          MoSJE Central Grid • 28 States & 8 UTs
        </span>
      </div>

      {/* National KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block mb-1">
            Total Monitored Cohort (Pan-India)
          </span>
          <span className="text-3xl font-extrabold font-['Space_Grotesk']">18,420</span>
          <span className="text-xs text-slate-400 block mt-1">Across 748 Special Courts</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            National Avg Distress Index
          </span>
          <span className="text-3xl font-extrabold text-slate-900 font-['Space_Grotesk']">54.2</span>
          <span className="text-xs text-emerald-600 block mt-1 font-semibold">↓ 3.8 pts vs FY25 Baseline</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Witness Protection Compliance
          </span>
          <span className="text-3xl font-extrabold text-emerald-600 font-['Space_Grotesk']">96.4%</span>
          <span className="text-xs text-slate-500 block mt-1">WPS 2018 Statutory Orders</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Centrally Sponsored DBT Relief
          </span>
          <span className="text-3xl font-extrabold text-indigo-700 font-['Space_Grotesk']">₹ 142.8 Cr</span>
          <span className="text-xs text-slate-500 block mt-1">100% Direct to Bank Account</span>
        </div>
      </div>

      {/* State Aggregated Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              State-by-State Wellbeing & Protection Index
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative distress tracking and intervention execution rates.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
              <tr>
                <th className="py-3 px-4">State / UT</th>
                <th className="py-3 px-3">Active Monitored Cases</th>
                <th className="py-3 px-3 text-center">Avg Distress Score</th>
                <th className="py-3 px-3">High-Risk Prevalence</th>
                <th className="py-3 px-3">Intervention Execution Rate</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {stateData.map((s) => (
                <tr key={s.state} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{s.state}</td>
                  <td className="py-3.5 px-3 font-mono">{s.activeCases.toLocaleString()}</td>
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`font-bold font-mono px-2 py-0.5 rounded text-xs ${
                        s.avgDistress >= 60
                          ? 'bg-rose-50 text-rose-700'
                          : s.avgDistress >= 50
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {s.avgDistress} / 100
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-rose-600">{s.highRiskRate}</td>
                  <td className="py-3.5 px-3 font-semibold text-emerald-700">{s.interventionRate}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" /> Fully Compliant
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
