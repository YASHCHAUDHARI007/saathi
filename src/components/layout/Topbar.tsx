import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Bell,
  HelpCircle,
  Sparkles,
  Menu,
  ShieldCheck,
  User,
  ChevronDown,
  X,
  AlertTriangle,
  PlayCircle,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RiskBadge } from '../common/RiskBadge';

interface TopbarProps {
  onOpenMobileMenu: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileMenu }) => {
  const {
    userName,
    userRole,
    userDistrict,
    unreadAlertsCount,
    alerts,
    filters,
    setFilters,
    setShowCheckInSimulator,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const demoSteps = [
    { label: '1. Executive Overview', path: '/dashboard' },
    { label: '2. High-Risk Case Profile', path: '/cases/ATC-2026-10482' },
    { label: '3. Real-Time Risk Alerts', path: '/alerts' },
    { label: '4. Intervention Center', path: '/interventions' },
    { label: '5. Multi-Channel Check-ins', path: '/check-ins' },
    { label: '6. District Analytics', path: '/district' },
    { label: '7. State Intelligence', path: '/state' },
    { label: '8. National Intelligence', path: '/national' },
    { label: '9. Privacy & Security', path: '/security' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      {/* Top tier: Greeting & System Global Bar */}
      <div className="px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Mobile trigger & Greeting */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base lg:text-lg font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk']">
                Good morning, {userRole.split(' ')[0]}
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Monitoring Active
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Here’s the current victim wellbeing and atrocity case-monitoring overview.
            </p>
          </div>
        </div>

        {/* Center: Global Search Input */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Search Case ID (e.g. 10482), Victim ID, District, or Type..."
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Action Icons & User Profile */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Check-in Simulator Quick Action */}
          <button
            onClick={() => setShowCheckInSimulator(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-colors cursor-pointer"
            title="Simulate incoming victim check-in message"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Simulate Check-in</span>
          </button>

          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadAlertsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-fadeIn">
                <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-300" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">Active Wellbeing Alerts</h4>
                  </div>
                  <span className="text-[11px] text-indigo-300 font-medium">
                    {unreadAlertsCount} unread
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        setShowNotifications(false);
                        navigate(`/cases/${alert.caseId}`);
                      }}
                      className="p-3 hover:bg-slate-50 transition-colors cursor-pointer text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900">{alert.caseId}</span>
                        <RiskBadge level={alert.riskLevel} size="sm" />
                      </div>
                      <p className="text-slate-600 font-medium line-clamp-2">{alert.reason}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Detected: {alert.detectedAt} • {alert.district}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/alerts');
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    View All Alerts Center →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Help / Guide */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            title="System Guide & Problem Statement 26094 Info"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
              {userName.charAt(0)}
            </div>
            <div className="hidden xl:block text-left">
              <span className="block text-xs font-bold text-slate-800 truncate max-w-[130px]">
                {userName.split('(')[0]}
              </span>
              <span className="block text-[10px] text-slate-500 font-medium">{userDistrict}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Second tier: SIH Judge Presentation Quick-Jump Navigation Bar */}
      <div className="bg-slate-900 text-white px-4 lg:px-6 py-2 flex items-center gap-2 overflow-x-auto custom-scrollbar text-xs">
        <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <PlayCircle className="w-3.5 h-3.5 text-indigo-400" /> SIH Demo Flow:
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {demoSteps.map((step) => {
            const isCurrent = location.pathname === step.path;
            return (
              <button
                key={step.path}
                onClick={() => navigate(step.path)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {step.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Help / System Guide Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">SAATHI — System Guide & UX Philosophy</h3>
                <p className="text-xs text-slate-300">Smart India Hackathon Problem Statement 26094</p>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200">
                <h4 className="font-bold text-indigo-950 mb-1">
                  The 5 Core Questions SAATHI Answers Immediately:
                </h4>
                <ol className="list-decimal list-inside space-y-1 font-medium text-slate-800">
                  <li><strong>How is the victim/witness doing now?</strong> (Dynamic Distress Score)</li>
                  <li><strong>Is their condition changing?</strong> (7-Day / 30-Day Trend Velocity)</li>
                  <li><strong>Is it getting worse?</strong> (Early Escalation Predictions & Alerts)</li>
                  <li><strong>Why does the system believe this?</strong> (Explainable Factor Attribution)</li>
                  <li><strong>Who needs to act?</strong> (Targeted Multi-Agency Interventions)</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900">Recommended SIH Demo Presentation Flow:</h4>
                <p>1. Start on <strong>Overview Dashboard</strong> to show population-level trends and KPIs.</p>
                <p>2. Open <strong>Case ATC-2026-10482</strong> to demonstrate the Dynamic Distress Score (82/100, +14 over 7 days).</p>
                <p>3. Review <strong>Multi-Modal Signals</strong> (Text, Voice stress, Engagement drops).</p>
                <p>4. Click <strong>"View AI Reasoning"</strong> to reveal Explainable Factors (+18, +14, +12).</p>
                <p>5. Demonstrate <strong>Intervention Scheduling</strong> and <strong>Case Lifecycle Tracking</strong>.</p>
                <p>6. Navigate through <strong>District, State, and National Intelligence</strong> pages.</p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  Close Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
