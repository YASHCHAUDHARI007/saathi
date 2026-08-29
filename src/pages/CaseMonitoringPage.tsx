import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderOpen,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Plus,
  Sparkles,
  LayoutGrid,
  List,
  MapPin,
  Clock,
  ShieldAlert,
  ChevronRight,
  Eye,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RiskBadge, PriorityBadge, StageBadge } from '../components/common/RiskBadge';
import { RiskLevel, CaseStage, CaseType } from '../types';

export const CaseMonitoringPage: React.FC = () => {
  const {
    cases,
    filteredCases,
    filters,
    setFilters,
    openReasoningDrawer,
    openInterventionModal,
    setShowCheckInSimulator,
    isDemoMode,
    recordTotals,
  } = useApp();

  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortBy, setSortBy] = useState<'distress' | 'recent' | 'risk'>('distress');

  const districts = ['All', ...Array.from(new Set(cases.map((item) => item.district).filter(Boolean))).sort()];
  const stages: ('All' | CaseStage)[] = [
    'All',
    'Complaint',
    'Investigation',
    'Trial',
    'Judgment',
    'Compensation',
    'Rehabilitation',
    'Closure',
  ];
  const riskLevels: ('All' | RiskLevel)[] = ['All', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'];

  // Sorting
  const sortedCases = [...filteredCases].sort((a, b) => {
    if (sortBy === 'distress') return b.distressScore - a.distressScore;
    if (sortBy === 'risk') {
      const order = { CRITICAL: 4, HIGH: 3, MODERATE: 2, LOW: 1 };
      return order[b.riskLevel] - order[a.riskLevel];
    }
    return 0;
  });

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      riskLevel: 'All',
      stage: 'All',
      district: 'All',
      caseType: 'All',
      counsellor: 'All',
      dateRange: '30D',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-indigo-600" />
            <h1 className="text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk']">
              Active Case Monitoring Register
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Showing {cases.length} loaded case records out of {recordTotals.cases} accessible records.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
              }`}
              title="Grid Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {isDemoMode && <button
            onClick={() => setShowCheckInSimulator(true)}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> Simulate Pulse
          </button>}
        </div>
      </div>

      {/* Filter and Search Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Search by Case ID, Anonymous Victim, or Keywords..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* District Filter */}
          <div>
            <select
              value={filters.district}
              onChange={(e) => setFilters((prev) => ({ ...prev, district: e.target.value }))}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium"
            >
              {districts.map((d) => (
                <option key={d} value={d}>
                  District: {d}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              value={filters.riskLevel}
              onChange={(e) => setFilters((prev) => ({ ...prev, riskLevel: e.target.value as any }))}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium"
            >
              {riskLevels.map((r) => (
                <option key={r} value={r}>
                  Risk: {r}
                </option>
              ))}
            </select>
          </div>

          {/* Case Stage Filter */}
          <div>
            <select
              value={filters.stage}
              onChange={(e) => setFilters((prev) => ({ ...prev, stage: e.target.value }))}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium"
            >
              {stages.map((s) => (
                <option key={s} value={s}>
                  Stage: {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary & Active Tags */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">
              Showing <strong className="text-indigo-700">{sortedCases.length}</strong> filtered records on this loaded page ({recordTotals.cases} accessible in total)
            </span>

            {(filters.searchQuery ||
              filters.district !== 'All' ||
              filters.riskLevel !== 'All' ||
              filters.stage !== 'All') && (
              <button
                onClick={resetFilters}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer ml-2"
              >
                <X className="w-3.5 h-3.5" /> Clear filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-semibold py-1 px-2 rounded-lg border border-slate-200 bg-slate-50"
            >
              <option value="distress">Highest Distress Score</option>
              <option value="risk">Risk Severity Stratum</option>
              <option value="recent">Most Recent Check-in</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Rendering: Table vs Cards */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Case ID</th>
                  <th className="py-3.5 px-3">Subject ID</th>
                  <th className="py-3.5 px-3">Case Type</th>
                  <th className="py-3.5 px-3">District</th>
                  <th className="py-3.5 px-3">Legal Stage</th>
                  <th className="py-3.5 px-3 text-center">Distress Score</th>
                  <th className="py-3.5 px-3">7D Trend</th>
                  <th className="py-3.5 px-3">Risk Level</th>
                  <th className="py-3.5 px-3">Last Pulse</th>
                  <th className="py-3.5 px-3">Assigned Counsellor</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {sortedCases.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/cases/${c.id}`)}
                    className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-bold text-indigo-700 group-hover:text-indigo-900 font-mono">
                      {c.id}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-slate-900 block">{c.victimAnonymousId}</span>
                      <span className="text-[10px] text-slate-500">{c.subjectRole}</span>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800">{c.caseType}</td>
                    <td className="py-3.5 px-3">{c.district}</td>
                    <td className="py-3.5 px-3">
                      <StageBadge stage={c.currentStage} isCurrent />
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`text-base font-extrabold font-['Space_Grotesk'] ${
                          c.distressScore >= 80
                            ? 'text-rose-600'
                            : c.distressScore >= 60
                            ? 'text-amber-600'
                            : 'text-slate-800'
                        }`}
                      >
                        {c.distressScore}
                      </span>
                      <span className="text-[10px] text-slate-400">/100</span>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-800">{c.trend}</td>
                    <td className="py-3.5 px-3">
                      <RiskBadge level={c.riskLevel} size="sm" showPulse />
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">{c.lastInteractionTime}</td>
                    <td className="py-3.5 px-3 text-slate-600 truncate max-w-[120px]">{c.assignedCounsellor}</td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openReasoningDrawer(c)}
                          className="px-2 py-1 text-[11px] font-bold rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                        >
                          Explain AI
                        </button>
                        <button
                          onClick={() => navigate(`/cases/${c.id}`)}
                          className="px-2.5 py-1 text-[11px] font-bold rounded bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          Profile
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedCases.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/cases/${c.id}`)}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-bold font-mono text-indigo-700 block mb-0.5">
                      {c.id}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{c.victimAnonymousId}</h3>
                    <p className="text-xs text-slate-500 font-medium">{c.caseType} • {c.district}</p>
                  </div>
                  <RiskBadge level={c.riskLevel} size="sm" showPulse />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-baseline justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Distress Score</span>
                    <span className="text-2xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                      {c.distressScore}
                      <span className="text-xs text-slate-400 font-medium">/100</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">7D Velocity</span>
                    <span className="text-xs font-bold text-rose-600">{c.trend}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Stage:</span>
                    <span className="font-semibold text-slate-800">{c.currentStage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[150px]">{c.assignedCounsellor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Pulse:</span>
                    <span className="text-slate-700">{c.lastInteractionTime}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openReasoningDrawer(c);
                  }}
                  className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Explain AI
                </button>

                <span className="font-bold text-slate-900 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  View Full File <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
