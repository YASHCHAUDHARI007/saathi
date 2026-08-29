import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartHandshake,
  Shield,
  Stethoscope,
  Building,
  Coins,
  Scale,
  Users,
  CheckCircle2,
  PlusCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PriorityBadge, StatusBadge } from '../components/common/RiskBadge';
import { InterventionType, InterventionStatus } from '../types';

export const InterventionCenterPage: React.FC = () => {
  const {
    cases,
    openInterventionModal,
    recordTotals,
  } = useApp();

  const navigate = useNavigate();

  const [filterType, setFilterType] = useState<'All' | InterventionType>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | InterventionStatus>('All');

  // Collect all interventions across all cases
  const allInterventions = cases.flatMap((c) =>
    c.interventions.map((inv) => ({ ...inv, caseItem: c }))
  );

  const filteredInterventions = allInterventions.filter((inv) => {
    if (filterType !== 'All' && inv.type !== filterType) return false;
    if (filterStatus !== 'All' && inv.status !== filterStatus) return false;
    return true;
  });

  const categoryDefinitions: { type: InterventionType; label: string; icon: typeof HeartHandshake }[] = [
    { type: 'Counselling', label: 'Counselling & Trauma Care', icon: HeartHandshake },
    { type: 'Witness Protection', label: 'Witness Protection (WPS)', icon: Shield },
    { type: 'Medical Treatment', label: 'Medical & Forensic Care', icon: Stethoscope },
    { type: 'Relocation Support', label: 'Relocation & Safe Transit', icon: Building },
    { type: 'Financial Assistance', label: 'Victim Compensation (DBT)', icon: Coins },
    { type: 'Legal Aid', label: 'DLSA Legal Aid & Counsel', icon: Scale },
    { type: 'Rehabilitation', label: 'Livelihood Rehabilitation', icon: Users },
  ];
  const categories = categoryDefinitions.map((category) => ({
    ...category,
    count: allInterventions.filter((item) =>
      item.type === category.type && item.status !== 'Completed'
    ).length,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-indigo-600" />
            <h1 className="text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk']">
              Multi-Agency Intervention Command Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Statutory protective, psychological, legal, and economic rehabilitation tracking across government departments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/cases')}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Select a Case to Create</span>
          </button>
        </div>
      </div>

      {/* 7 Statutory Category Quick Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = filterType === cat.type;

          return (
            <div
              key={cat.type}
              onClick={() => setFilterType(isSelected ? 'All' : cat.type)}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col justify-between items-center ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-500/30'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div
                className={`p-2 rounded-xl mb-1.5 ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold leading-tight mb-1">{cat.type}</h4>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {cat.count} loaded active
              </span>
            </div>
          );
        })}
      </div>

      {/* Filter and Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Intervention Action Register
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              ({filteredInterventions.length} loaded records matching; {recordTotals.interventions} accessible total)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="text-xs font-semibold py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50"
            >
              <option value="All">All Statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Escalated">Escalated</option>
            </select>
          </div>
        </div>

        {/* List of Interventions */}
        <div className="space-y-3">
          {filteredInterventions.map((inv) => (
            <div
              key={`${inv.caseId}-${inv.id}`}
              className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white transition-all space-y-2.5 text-xs shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      onClick={() => navigate(`/cases/${inv.caseId}`)}
                      className="font-bold text-indigo-700 hover:underline cursor-pointer font-mono"
                    >
                      {inv.caseId}
                    </span>
                    <span className="text-slate-500 font-medium">({inv.caseItem.victimAnonymousId})</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {inv.type}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{inv.title}</h4>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <PriorityBadge priority={inv.priority} />
                  <StatusBadge status={inv.status} />
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed font-medium">{inv.reason}</p>

              {inv.actionNotes && (
                <div className="p-2 rounded-lg bg-indigo-50/60 border border-indigo-100 text-[11px] text-slate-700">
                  <strong className="text-indigo-950">Action Log:</strong> {inv.actionNotes}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-[11px]">
                <span className="text-slate-500">
                  Assigned Specialist: <strong className="text-slate-800">{inv.assignedTo}</strong> ({inv.assignedRole})
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openInterventionModal(inv.caseItem, inv)}
                    className="px-2.5 py-1 font-bold rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 transition-colors cursor-pointer"
                  >
                    {inv.status === 'Completed' ? 'View completed record' : 'Assign / update workflow'}
                  </button>

                  {inv.status === 'Completed' && (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
