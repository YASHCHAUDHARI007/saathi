import React from 'react';
import {
  Building2,
  TrendingUp,
  MapPin,
  ShieldAlert,
  Users,
  CheckCircle2,
  Scale,
  FileCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { mockDistrictData } from '../data/mockData';

export const StateAnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h1 className="text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk']">
              State-Level Oversight & Policy Dashboard (Maharashtra)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Aggregated cross-district monitoring, witness protection deployment, and SLA compliance metrics.
          </p>
        </div>

        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200">
          State Directorate of Social Justice
        </span>
      </div>

      {/* State KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Monitored Cases
          </span>
          <span className="text-2xl font-extrabold text-slate-900 font-['Space_Grotesk']">1,284</span>
          <span className="text-[11px] text-emerald-600 block mt-1 font-semibold">+8.4% month-over-month</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Statewide High-Risk Cases
          </span>
          <span className="text-2xl font-extrabold text-rose-600 font-['Space_Grotesk']">142</span>
          <span className="text-[11px] text-slate-500 block mt-1 font-medium">11.0% of total cohort</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Avg Intervention SLA
          </span>
          <span className="text-2xl font-extrabold text-emerald-600 font-['Space_Grotesk']">3.8 Hrs</span>
          <span className="text-[11px] text-emerald-600 block mt-1 font-semibold">Target &lt; 6.0 Hrs (Compliant)</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Rehabilitation Relief Disbursed
          </span>
          <span className="text-2xl font-extrabold text-indigo-700 font-['Space_Grotesk']">₹ 4.82 Cr</span>
          <span className="text-[11px] text-slate-500 block mt-1 font-medium">Direct Benefit Transfer</span>
        </div>
      </div>

      {/* District Comparative Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            District Comparison: Monitored Cases vs High-Risk Volume
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Resource deployment prioritization across Maharashtra districts.
          </p>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockDistrictData} margin={{ top: 15, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="district" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="activeCases" name="Total Cases" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="highRiskCases" name="High Risk Cases" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
