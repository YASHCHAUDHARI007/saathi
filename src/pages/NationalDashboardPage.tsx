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
import { useApp } from '../context/AppContext';

export const NationalDashboardPage: React.FC = () => {
  const { usesMockApi, nationalOverview, stateMetrics } = useApp();

  if (!usesMockApi && !nationalOverview) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <h1 className="text-lg font-bold">National analytics integration is pending</h1>
        <p className="mt-1 text-xs">The configured national aggregate endpoint returned no accessible overview for this account.</p>
      </div>
    );
  }

  const overview = nationalOverview ?? {
    totalCasesMonitored: 18420,
    highVulnerabilityCases: 2140,
    activeUnresolvedAlerts: 312,
    interventionsCompleted: 9670,
    avgNationalDistressIndex: 54.2,
    participatingStates: 7,
    participatingDistricts: 0,
    cctnsSyncStatus: 'Demo value',
    eCourtsSyncStatus: 'Demo value',
    dlsaSyncStatus: 'Demo value',
  };
  const stateData = usesMockApi ? [
    { state: 'Maharashtra', activeCases: 1284, avgDistress: 56, criticalAlerts: 18, dlsaCoverage: 94.2 },
    { state: 'Uttar Pradesh', activeCases: 2150, avgDistress: 62, criticalAlerts: 31, dlsaCoverage: 88.5 },
    { state: 'Madhya Pradesh', activeCases: 1420, avgDistress: 59, criticalAlerts: 22, dlsaCoverage: 91.0 },
  ] : stateMetrics.map((state) => ({
    state: state.stateName,
    activeCases: state.totalCases,
    avgDistress: state.stateAvgDistress,
    criticalAlerts: state.criticalAlerts,
    dlsaCoverage: state.dlsaCoverage,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-indigo-600" />
            <h1 className="text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk']">
              Prototype National Wellbeing View
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {usesMockApi
              ? 'Illustrative SIH presentation data; not an official government monitoring system.'
              : 'Authorized national aggregates returned by the configured backend.'}
          </p>
        </div>

        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          {usesMockApi ? 'Illustrative mock dataset' : 'Authorized API aggregates'}
        </span>
      </div>

      {/* National KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block mb-1">
            Total Monitored Cohort (Pan-India)
          </span>
          <span className="text-3xl font-extrabold font-['Space_Grotesk']">{overview.totalCasesMonitored.toLocaleString()}</span>
          <span className="text-xs text-slate-400 block mt-1">{overview.participatingStates} states • {overview.participatingDistricts} districts</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            National Avg Distress Index
          </span>
          <span className="text-3xl font-extrabold text-slate-900 font-['Space_Grotesk']">{overview.avgNationalDistressIndex ?? 'No data'}</span>
          <span className="text-xs text-slate-500 block mt-1 font-semibold">Backend aggregate</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            High-Vulnerability Cases
          </span>
          <span className="text-3xl font-extrabold text-rose-600 font-['Space_Grotesk']">{overview.highVulnerabilityCases.toLocaleString()}</span>
          <span className="text-xs text-slate-500 block mt-1">{overview.activeUnresolvedAlerts} unresolved alerts</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Completed Interventions
          </span>
          <span className="text-3xl font-extrabold text-indigo-700 font-['Space_Grotesk']">{overview.interventionsCompleted.toLocaleString()}</span>
          <span className="text-xs text-slate-500 block mt-1">Recorded aggregate; effectiveness not asserted</span>
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
                <th className="py-3 px-3">Critical Alerts</th>
                <th className="py-3 px-3">Reported DLSA Coverage</th>
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
                        s.avgDistress === null
                          ? 'bg-slate-100 text-slate-600'
                          : s.avgDistress >= 60
                          ? 'bg-rose-50 text-rose-700'
                          : s.avgDistress >= 50
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {s.avgDistress === null ? 'No data' : `${s.avgDistress} / 100`}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-rose-600">{s.criticalAlerts}</td>
                  <td className="py-3.5 px-3 font-semibold text-emerald-700">
                    {s.dlsaCoverage === null ? 'Not reported' : `${s.dlsaCoverage}%`}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" /> {usesMockApi ? 'Demo value only' : 'Backend record'}
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
