import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BellRing,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Sparkles,
  PhoneCall,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RiskBadge, PriorityBadge } from '../components/common/RiskBadge';
import { RiskLevel } from '../types';

export const RiskAlertsPage: React.FC = () => {
  const { alerts, unreadAlertsCount, acknowledgeAlert, openReasoningDrawer, getCaseById } = useApp();
  const navigate = useNavigate();

  const [filterLevel, setFilterLevel] = useState<'All' | RiskLevel>('All');
  const [showAcknowledged, setShowAcknowledged] = useState(true);

  const filteredAlerts = alerts.filter((a) => {
    if (filterLevel !== 'All' && a.riskLevel !== filterLevel) return false;
    if (!showAcknowledged && a.status === 'Acknowledged') return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk']">
                Real-Time Risk & Escalation Alert Center
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Live notification stream triggered by acute distress delta, threat vocabulary, acoustic vocal tremors, or missed check-ins.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            {unreadAlertsCount} Unacknowledged Critical Alerts
          </span>
        </div>
      </div>

      {/* Filter and Tab controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {(['All', 'CRITICAL', 'HIGH', 'MODERATE'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterLevel === lvl
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lvl === 'All' ? 'All Alerts' : `${lvl} Risk`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs">
          <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={showAcknowledged}
              onChange={(e) => setShowAcknowledged(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Show Acknowledged Records
          </label>

          <span className="text-slate-400">|</span>
          <span className="text-slate-500 font-semibold">
            Average Officer Response SLA: <strong className="text-emerald-700">18 mins</strong>
          </span>
        </div>
      </div>

      {/* Alert Cards Feed */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const isPending = alert.status === 'Pending';
          const caseObj = getCaseById(alert.caseId);

          return (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border transition-all ${
                isPending
                  ? 'bg-white border-rose-200/90 shadow-sm hover:border-rose-300 ring-1 ring-rose-500/10'
                  : 'bg-slate-50/70 border-slate-200 opacity-90'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                {/* Left info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {alert.caseId}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {alert.victimAnonymousId}
                    </span>
                    <RiskBadge level={alert.riskLevel} size="sm" showPulse={isPending} />
                    <span className="text-[11px] text-slate-400 font-medium">
                      District: {alert.district} • Detected: {alert.detectedAt}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {alert.reason}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3.5 h-3.5" /> SLA Target: <strong className="text-rose-600">{alert.slaTimeRemaining}</strong>
                    </span>
                    <span>•</span>
                    <span>Assigned Officer: <strong>{alert.assignedOfficer}</strong></span>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
                  {caseObj && (
                    <button
                      onClick={() => openReasoningDrawer(caseObj)}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Explain AI
                    </button>
                  )}

                  <button
                    onClick={() => navigate(`/cases/${alert.caseId}`)}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Open Case File
                  </button>

                  {isPending ? (
                    <button
                      onClick={() => acknowledgeAlert(alert.id, 'Verified threat report with protection squad.')}
                      className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledge
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledged
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
