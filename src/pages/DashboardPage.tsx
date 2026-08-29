import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderOpen,
  Eye,
  AlertTriangle,
  AlertOctagon,
  HeartHandshake,
  Clock,
  TrendingUp,
  Filter,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Brain,
  MessageSquare,
  Activity,
  Layers,
  PhoneCall,
  MessageCircle,
  Radio,
  FileCheck,
  Zap,
  HelpCircle,
  BarChart3,
  Flame,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { KpiCard } from '../components/common/KpiCard';
import { RiskBadge, PriorityBadge, StageBadge } from '../components/common/RiskBadge';
import { SystemWorkflowFeedbackLoop } from '../components/common/SystemWorkflowFeedbackLoop';

export const DashboardPage: React.FC = () => {
  const {
    cases,
    alerts,
    unreadAlertsCount,
    setFilters,
    openReasoningDrawer,
    setShowCheckInSimulator,
    isDemoMode,
    usesMockApi,
    recordTotals,
  } = useApp();

  const navigate = useNavigate();
  const [trendRange, setTrendRange] = useState<'7D' | '30D' | '90D' | '1Y'>('30D');

  const loadedCaseCount = cases.length;
  const totalCases = recordTotals.cases;
  const monitoredCases = cases.filter((item) => item.monitoringStatus !== 'Dormant').length;
  const riskCounts = {
    LOW: cases.filter((item) => item.riskLevel === 'LOW').length,
    MODERATE: cases.filter((item) => item.riskLevel === 'MODERATE').length,
    HIGH: cases.filter((item) => item.riskLevel === 'HIGH').length,
    CRITICAL: cases.filter((item) => item.riskLevel === 'CRITICAL').length,
  };
  const highRiskCount = riskCounts.HIGH + riskCounts.CRITICAL;
  const interventions = cases.flatMap((item) => item.interventions);
  const loadedInterventionCount = interventions.length;
  const interventionCount = recordTotals.interventions;
  const completedInterventions = interventions.filter((item) => item.status === 'Completed').length;
  const followUpsDue = cases.reduce((total, item) => total + item.missedFollowUps, 0);
  const percentage = (count: number) => loadedCaseCount > 0 ? Math.round((count / loadedCaseCount) * 100) : 0;

  const riskPieData = [
    { name: 'Low Risk', value: percentage(riskCounts.LOW), color: '#10b981', count: riskCounts.LOW },
    { name: 'Moderate Risk', value: percentage(riskCounts.MODERATE), color: '#f59e0b', count: riskCounts.MODERATE },
    { name: 'High Risk', value: percentage(riskCounts.HIGH), color: '#f97316', count: riskCounts.HIGH },
    { name: 'Critical Risk', value: percentage(riskCounts.CRITICAL), color: '#e11d48', count: riskCounts.CRITICAL },
  ];

  const trajectoryByDate = new Map<string, { total: number; count: number; highRiskCases: number }>();
  cases.forEach((caseItem) => caseItem.longitudinalTrajectory.forEach((point) => {
    if (!point.date) return;
    const current = trajectoryByDate.get(point.date) ?? { total: 0, count: 0, highRiskCases: 0 };
    current.total += point.distressScore;
    current.count += 1;
    if (point.distressScore >= 60) current.highRiskCases += 1;
    trajectoryByDate.set(point.date, current);
  }));
  const selectedPointCount = trendRange === '7D' ? 7 : trendRange === '30D' ? 30 : trendRange === '90D' ? 90 : 365;
  const interventionRate = loadedInterventionCount > 0 ? Math.round((completedInterventions / loadedInterventionCount) * 100) : 0;
  const populationTrend = [...trajectoryByDate.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(-selectedPointCount)
    .map(([date, aggregate]) => ({
      date,
      avgDistress: Math.round(aggregate.total / aggregate.count),
      highRiskCases: aggregate.highRiskCases,
      interventionRate,
    }));

  // Cases requiring attention (sorted by highest distress and P1 priority)
  const prioritizedCases = [...cases]
    .sort((a, b) => b.distressScore - a.distressScore)
    .slice(0, 7);

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* BENTO ROW 1: System Command & Real-Time Ingress Snapshot */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Bento Hero Card (8 cols) */}
        <div className="lg:col-span-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 lg:p-7 border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between">
          {/* Subtle background glow decoration */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="space-y-3 relative z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                {usesMockApi ? 'Explicit local mock dataset' : 'Connected backend view'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                SIH Prototype • PS-26094
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-300" /> Compliance review pending
              </span>
            </div>

            <h1 className="text-xl lg:text-2xl font-black tracking-tight text-white font-['Space_Grotesk'] leading-tight">
              Scoped Victim Wellbeing Monitoring & Case Coordination
            </h1>

            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl font-normal">
              Accessible totals: <strong className="text-indigo-200">Cases:</strong> {totalCases} • <strong className="text-indigo-200">Interventions:</strong> {interventionCount}. The risk and unread-alert breakdowns below describe the currently loaded API page.
            </p>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-4 text-xs text-slate-300">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Accessible Cases</span>
                <span className="font-extrabold text-white font-['Space_Grotesk'] text-sm">{totalCases.toLocaleString()} Records</span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Unread (Loaded Page)</span>
                <span className="font-extrabold text-rose-400 font-['Space_Grotesk'] text-sm">{unreadAlertsCount} Urgent</span>
              </div>
              <div className="h-6 w-px bg-slate-800 hidden sm:block" />
              <div className="hidden sm:block">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Distress Model</span>
                <span className="font-extrabold text-amber-300 font-['Space_Grotesk'] text-sm">Prototype scoring</span>
              </div>
            </div>

            {isDemoMode && <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => navigate('/cases/ATC-2026-10482')}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Demo Case (ATC-2026-10482)</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>}
          </div>
        </div>

        {/* Bento Ingress Engine Snapshot (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <Brain className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Multi-Modal Ingress Feeds
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {isDemoMode ? 'Illustrative feeds' : 'Health API pending'}
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              {isDemoMode
                ? 'Illustrative multi-channel signal examples for the prototype:'
                : 'The backend does not currently expose verified ingress-service health.'}
            </p>

            {isDemoMode ? <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-indigo-50/50 transition-colors">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="font-semibold text-slate-800">IVRS Automated Voice Pulse</span>
                </div>
                <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  83/100 Stress
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-indigo-50/50 transition-colors">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-semibold text-slate-800">Vernacular SMS NLP (Marathi)</span>
                </div>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Threat Signal
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-indigo-50/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-semibold text-slate-800">Check-in Latency Drop</span>
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  -40% Velocity
                </span>
              </div>
            </div> : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                No live feed-health or model-runtime status is asserted by this screen.
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100">
            {isDemoMode && <button
              onClick={() => setShowCheckInSimulator(true)}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Simulate Live Check-in Pulse</span>
            </button>}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BENTO ROW 2: Modular Metric Bento Blocks */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
        <KpiCard
          title="Accessible Cases"
          value={totalCases}
          trendText="Server total"
          trendDirection="neutral"
          trendPositiveIsGood={true}
          icon={FolderOpen}
          variant="indigo"
          onClick={() => navigate('/cases')}
        />
        <KpiCard
          title="Cases Monitored"
          value={monitoredCases}
          trendText="Loaded page"
          trendDirection="neutral"
          trendPositiveIsGood={true}
          icon={Eye}
          variant="default"
          onClick={() => navigate('/cases')}
        />
        <KpiCard
          title="High Risk"
          value={highRiskCount}
          trendText="Loaded page"
          trendDirection="neutral"
          trendPositiveIsGood={false}
          icon={AlertTriangle}
          variant="warning"
          onClick={() => {
            setFilters((prev) => ({ ...prev, riskLevel: 'HIGH' }));
            navigate('/cases');
          }}
        />
        <KpiCard
          title="Critical Alerts"
          value={alerts.filter((item) => item.riskLevel === 'CRITICAL' && item.status === 'Unread').length}
          trendText="Loaded page"
          trendDirection="neutral"
          trendPositiveIsGood={false}
          icon={AlertOctagon}
          variant="danger"
          onClick={() => navigate('/alerts')}
        />
        <KpiCard
          title="Accessible Interventions"
          value={interventionCount}
          trendText={`${completedInterventions} complete on loaded page`}
          trendDirection="neutral"
          trendPositiveIsGood={true}
          icon={HeartHandshake}
          variant="success"
          onClick={() => navigate('/interventions')}
        />
        <KpiCard
          title="Follow-ups Due"
          value={followUpsDue}
          trendText="Loaded page"
          trendDirection="neutral"
          trendPositiveIsGood={true}
          icon={Clock}
          variant="warning"
          onClick={() => navigate('/interventions')}
        />
      </div>

      {/* ========================================================================= */}
      {/* BENTO ROW 3: Visual System Workflow Feedback Loop Component */}
      {/* ========================================================================= */}
      <SystemWorkflowFeedbackLoop activeStepIndex={3} />

      {/* ========================================================================= */}
      {/* BENTO ROW 4: Longitudinal Trajectory & Risk Stratum */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Longitudinal Distress Trajectory Bento Card (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 p-5 lg:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <h3 className="text-xs lg:text-sm font-bold uppercase tracking-wider text-slate-900 font-['Space_Grotesk']">
                    Population Longitudinal Distress Trajectory
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Longitudinal distress velocity highlights critical inflection points (e.g. trial dates) rather than one-off surveys.
                </p>
              </div>

              {/* Time Range Filter Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200/60">
                {(['7D', '30D', '90D', '1Y'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTrendRange(range)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      trendRange === range
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {range === '7D'
                      ? '7 Days'
                      : range === '30D'
                      ? '30 Days'
                      : range === '90D'
                      ? '90 Days'
                      : '1 Year'}
                  </button>
                ))}
              </div>
            </div>

            {/* Metric Legends Bar */}
            <div className="flex flex-wrap items-center gap-4 py-2 mb-2 text-xs font-semibold border-b border-slate-100">
              <span className="flex items-center gap-1.5 text-indigo-700">
                <span className="w-3 h-1 bg-indigo-600 rounded-full" /> Average Distress Score (0-100)
              </span>
              <span className="flex items-center gap-1.5 text-amber-700">
                <span className="w-3 h-1 bg-amber-500 rounded-full" /> High-Risk Volume
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-3 h-1 bg-emerald-500 rounded-full" /> Intervention Rate (%)
              </span>
            </div>
          </div>

          {/* Recharts Line Chart */}
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={populationTrend} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                  }}
                />
                <ReferenceLine y={80} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Critical (80+)', fill: '#e11d48', fontSize: 10 }} />
                <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'High Risk (60+)', fill: '#d97706', fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="avgDistress"
                  name="Avg Distress"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#4f46e5' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="highRiskCases"
                  name="High Risk Count"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="interventionRate"
                  name="Intervention Rate %"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
            <span className="flex items-center gap-1 font-medium">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
              Derived from trajectory records attached to the loaded case page
            </span>
            <span className="font-mono text-slate-400">Refreshes from the configured API</span>
          </div>
        </div>

        {/* Risk Stratification & Distribution Donut (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 p-5 lg:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs lg:text-sm font-bold uppercase tracking-wider text-slate-900 font-['Space_Grotesk']">
                Risk Stratification
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {loadedCaseCount.toLocaleString()} Loaded
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Distribution by risk severity on the currently loaded case page.
            </p>
          </div>

          <div className="h-44 relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Stratum Ratio']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-slate-900 font-['Space_Grotesk']">{loadedCaseCount.toLocaleString()}</span>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Loaded Cases</span>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 text-emerald-950 border border-emerald-100 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Low Risk (0-30)
              </span>
              <span className="font-bold">{percentage(riskCounts.LOW)}% ({riskCounts.LOW})</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50 text-amber-950 border border-amber-100 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Moderate Risk (31-60)
              </span>
              <span className="font-bold">{percentage(riskCounts.MODERATE)}% ({riskCounts.MODERATE})</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-orange-50 text-orange-950 border border-orange-100 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500" /> High Risk (61-80)
              </span>
              <span className="font-bold">{percentage(riskCounts.HIGH)}% ({riskCounts.HIGH})</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50 text-rose-950 border border-rose-100 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" /> Critical Risk (81-100)
              </span>
              <span className="font-bold">{percentage(riskCounts.CRITICAL)}% ({riskCounts.CRITICAL})</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 text-center italic mt-2.5">
            {isDemoMode ? 'Explicit demo data' : 'Backend records'} • Compliance not asserted
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BENTO ROW 5: High-Priority Attention Register Bento Table */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 lg:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
              <h3 className="text-xs lg:text-sm font-bold uppercase tracking-wider text-slate-900 font-['Space_Grotesk']">
                Cases Requiring Immediate Human Review
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Prioritized by distress score velocity, threat signals, and impending legal trial milestones.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/cases')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition-colors"
            >
              <span>View All {totalCases.toLocaleString()} Cases</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Interactive Cases Bento Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Case ID</th>
                <th className="py-3.5 px-3">Subject ID / Role</th>
                <th className="py-3.5 px-3">Case Type</th>
                <th className="py-3.5 px-3">District</th>
                <th className="py-3.5 px-3">Case Stage</th>
                <th className="py-3.5 px-3 text-center">Distress Score</th>
                <th className="py-3.5 px-3">Trend (7d)</th>
                <th className="py-3.5 px-3">Risk Level</th>
                <th className="py-3.5 px-3">Last Ingress</th>
                <th className="py-3.5 px-3">Priority</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {prioritizedCases.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/cases/${c.id}`)}
                  className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-bold text-indigo-700 group-hover:text-indigo-900 font-mono">
                    {c.id}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="block font-semibold text-slate-900">{c.victimAnonymousId}</span>
                    <span className="text-[10px] text-slate-500">{c.subjectRole}</span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-800 font-semibold">{c.caseType}</td>
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
                  <td className="py-3.5 px-3">
                    <span
                      className={`text-xs font-bold ${
                        c.trendDirection === 'increasing'
                          ? 'text-rose-600'
                          : c.trendDirection === 'decreasing'
                          ? 'text-emerald-600'
                          : 'text-slate-600'
                      }`}
                    >
                      {c.trend}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <RiskBadge level={c.riskLevel} size="sm" showPulse />
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">{c.lastInteractionTime}</td>
                  <td className="py-3.5 px-3">
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openReasoningDrawer(c)}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                        title="Explain AI Factors"
                      >
                        Explain AI
                      </button>
                      <button
                        onClick={() => navigate(`/cases/${c.id}`)}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>
                    </div>
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
