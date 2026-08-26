import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  UserCheck,
  LineChart,
  BellRing,
  HeartHandshake,
  Milestone,
  MessageSquareHeart,
  MapPin,
  Building2,
  Globe2,
  FileText,
  Shield,
  Settings,
  Sparkles,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Heart,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { userRole, setUserRole, unreadAlertsCount, logout, setShowCheckInSimulator } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Overview Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Victim Care Portal', path: '/victim', icon: Heart, badge: 'Citizen App', isHighlighted: true },
    { label: 'Case Monitoring', path: '/cases', icon: FolderOpen },
    { label: 'Demo Case Profile', path: '/cases/ATC-2026-10482', icon: UserCheck, badge: 'High Risk' },
    { label: 'Distress Analytics', path: '/analytics', icon: LineChart },
    {
      label: 'Risk Alerts',
      path: '/alerts',
      icon: BellRing,
      count: unreadAlertsCount > 0 ? unreadAlertsCount : undefined,
      isAlert: true,
    },
    { label: 'Intervention Center', path: '/interventions', icon: HeartHandshake },
    { label: 'Communication / Check-ins', path: '/check-ins', icon: MessageSquareHeart },
    { label: 'District Analytics', path: '/district', icon: MapPin },
    { label: 'State Analytics', path: '/state', icon: Building2 },
    { label: 'National Intelligence', path: '/national', icon: Globe2 },
    { label: 'Reports & Exports', path: '/reports', icon: FileText },
    { label: 'Privacy & Security', path: '/security', icon: Shield },
    { label: 'System Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 select-none">
      {/* Platform Brand Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-extrabold shadow-md shadow-indigo-900/30 text-lg tracking-wider border border-indigo-400/30">
            सा
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-extrabold tracking-tight text-white font-['Space_Grotesk']">
                SAATHI
              </h1>
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                MoSJE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              Victim Wellbeing & Distress Monitoring
            </p>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-[10px] text-indigo-300/80 italic mt-2.5 font-medium border-l-2 border-indigo-500/50 pl-2">
          "Continuous support. Early intervention. Human-centered care."
        </p>
      </div>

      {/* Role Switcher */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/90">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          Active Role Persona
        </label>
        <select
          value={userRole}
          onChange={(e) => {
            const role = e.target.value as any;
            setUserRole(role);
            if (role === 'Victim / Citizen') {
              navigate('/victim');
            } else if (location.pathname === '/victim') {
              navigate('/dashboard');
            }
          }}
          className="w-full text-xs font-semibold py-1.5 px-2.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="District Officer">District Officer (Pune)</option>
          <option value="Counsellor">Clinical Counsellor (Trauma)</option>
          <option value="State Administrator">State Admin (Maharashtra)</option>
          <option value="National Administrator">National Admin (MoSJE HQ)</option>
          <option value="Victim / Citizen">Victim / Citizen (Anjali Gaikwad)</option>
        </select>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 custom-scrollbar">
        <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Core Workflows
        </span>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {item.badge}
                </span>
              )}

              {item.count && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    item.isAlert ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Simulator Shortcut & Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2">
        <button
          onClick={() => setShowCheckInSimulator(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Test Check-in Simulator
        </button>

        <div className="flex items-center justify-between pt-2 px-1 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px]">NIC Cloud (Secure)</span>
          </div>

          <button
            onClick={logout}
            className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-[10px]">Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
