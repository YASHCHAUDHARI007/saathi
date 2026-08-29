import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Building2,
  TrendingUp,
  AlertTriangle,
  Users,
  Search,
  Filter,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DistrictAnalyticsPage: React.FC = () => {
  const { setFilters, districtMetrics } = useApp();
  const navigate = useNavigate();
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>('Pune');
  const [searchDistrict, setSearchDistrict] = useState('');

  const filteredDistricts = districtMetrics.filter((district) =>
    district.name.toLowerCase().includes(searchDistrict.toLowerCase())
  );

  const activeDistrictObj =
    districtMetrics.find((district) => district.name === selectedDistrict) || districtMetrics[0];

  const handleDistrictDrilldown = (districtName: string) => {
    setFilters((prev) => ({ ...prev, district: districtName }));
    navigate('/cases');
  };

  if (!activeDistrictObj) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <h1 className="text-lg font-bold">District analytics are unavailable</h1>
        <p className="mt-1 text-xs">The configured analytics API returned no accessible district records.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <h1 className="text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk']">
              District Mental Health & Atrocity Distress Heat Map
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            District-level metrics returned by the configured analytics API for this account's jurisdiction.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            Accessible Districts: {districtMetrics.length}
          </span>
        </div>
      </div>

      {/* Selected District Spotlight Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                District Spotlight
              </span>
              <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded font-mono">
                {activeDistrictObj.name} Jurisdiction
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-white font-['Space_Grotesk']">
              {activeDistrictObj.name} District • {activeDistrictObj.activeCases} Active Cases
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Average Distress: <strong className="text-white">{activeDistrictObj.avgDistressScore === null ? 'No data' : `${activeDistrictObj.avgDistressScore}/100`}</strong> • High-Risk Cases: <strong className="text-rose-400">{activeDistrictObj.highRiskCases}</strong> • Counsellor Ratio: <strong className="text-white">{activeDistrictObj.counsellorRatio}</strong> • Completed Interventions: <strong className="text-emerald-400">{activeDistrictObj.interventionsCompleted}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleDistrictDrilldown(activeDistrictObj.name)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>View {activeDistrictObj.name} Cases in Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* District Cards Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              District Atrocity Risk Index Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any district card to inspect its workload, distress trajectory, and officer assignments.
            </p>
          </div>

          <div className="w-full sm:w-64 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchDistrict}
              onChange={(e) => setSearchDistrict(e.target.value)}
              placeholder="Filter district name..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredDistricts.map((d) => {
            const isSelected = selectedDistrict === d.name;

            return (
              <div
                key={d.name}
                onClick={() => setSelectedDistrict(d.name)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-indigo-50/70 border-indigo-500 shadow-md ring-2 ring-indigo-500/30'
                    : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-white shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">{d.name}</h4>
                  <span
                    className={`text-xs font-extrabold font-['Space_Grotesk'] px-2 py-0.5 rounded ${
                      d.avgDistressScore === null
                        ? 'bg-slate-100 text-slate-600'
                        : d.avgDistressScore >= 60
                        ? 'bg-rose-100 text-rose-800'
                        : d.avgDistressScore >= 50
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {d.avgDistressScore === null ? 'No data' : `${d.avgDistressScore} / 100`}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Active Cases:</span>
                    <strong className="text-slate-900">{d.activeCases}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">High Risk:</span>
                    <strong className="text-rose-600">{d.highRiskCases}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Counsellor Ratio:</span>
                    <strong className="text-slate-800">{d.counsellorRatio}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Completed Interventions:</span>
                    <strong className="text-emerald-700">{d.interventionsCompleted}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">API record</span>
                  <span className="font-bold text-indigo-700 flex items-center gap-0.5">
                    Select <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
