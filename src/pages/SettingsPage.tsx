import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Sliders,
  Users,
  Shield,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsPage: React.FC = () => {
  const { userRole, setUserRole, userDistrict } = useApp();
  const [criticalThreshold, setCriticalThreshold] = useState(80);
  const [highThreshold, setHighThreshold] = useState(60);
  const [slaMinutes, setSlaMinutes] = useState(30);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <h1 className="text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk']">
              System Configuration & Risk Thresholds
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Fine-tune dynamic distress alert limits, escalation SLA timers, and multi-channel notification routing.
          </p>
        </div>

        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          MoSJE Governance Engine
        </span>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2 text-xs font-semibold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>System configuration parameters saved and updated across all district nodes.</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Thresholds */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Dynamic Distress Alert Thresholds
            </h3>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Critical Risk Cutoff Score</span>
              <span className="text-rose-600 font-mono">{criticalThreshold} / 100</span>
            </div>
            <input
              type="range"
              min="70"
              max="95"
              value={criticalThreshold}
              onChange={(e) => setCriticalThreshold(Number(e.target.value))}
              className="w-full accent-rose-600"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Distress score above which immediate red-tier witness protection & emergency crisis teams are dispatched.
            </p>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>High Risk Cutoff Score</span>
              <span className="text-amber-600 font-mono">{highThreshold} / 100</span>
            </div>
            <input
              type="range"
              min="50"
              max="75"
              value={highThreshold}
              onChange={(e) => setHighThreshold(Number(e.target.value))}
              className="w-full accent-amber-600"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Triggers mandatory clinical counsellor review and fast-tracks relief disbursement.
            </p>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Escalation Response SLA (Minutes)</span>
              <span className="text-indigo-600 font-mono">{slaMinutes} mins</span>
            </div>
            <input
              type="number"
              min="5"
              max="120"
              value={slaMinutes}
              onChange={(e) => setSlaMinutes(Number(e.target.value))}
              className="w-full p-2 text-xs rounded-lg border border-slate-300 font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Maximum allowable officer acknowledgment window before state escalation.
            </p>
          </div>
        </div>

        {/* Notifications & Active Persona */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Notification Channels & Officer Persona
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Current Active Role</label>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-slate-50"
            >
              <option value="District Officer">District Officer ({userDistrict})</option>
              <option value="Counsellor">Clinical Counsellor (Trauma Focus)</option>
              <option value="State Administrator">State Administrator (Maharashtra)</option>
              <option value="National Administrator">National Director (MoSJE HQ)</option>
            </select>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between text-xs font-semibold text-slate-700 cursor-pointer">
              <span>High-Priority SMS Dispatch to On-Duty Police Squad</span>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between text-xs font-semibold text-slate-700 cursor-pointer">
              <span>Instant NIC Email Digest to District Social Welfare Officer</span>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </label>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Apply & Save System Configuration</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
