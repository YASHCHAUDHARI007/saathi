import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Shield,
  MapPin,
  Calendar,
  Phone,
  Sparkles,
  MessageSquare,
  Mic,
  Activity,
  Users,
  AlertTriangle,
  FileText,
  HeartHandshake,
  Clock,
  CheckCircle2,
  Lock,
  ChevronRight,
  TrendingUp,
  AlertOctagon,
  PlusCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { RiskBadge, PriorityBadge, StatusBadge, StageBadge } from '../components/common/RiskBadge';
import { DistressScoreGauge } from '../components/common/DistressScoreGauge';
import { AiInsightCard } from '../components/common/AiInsightCard';
import { CaseStage, LongitudinalDataPoint } from '../types';

const CASE_STAGE_SEQUENCE: readonly CaseStage[] = [
  'Complaint',
  'Investigation',
  'Trial',
  'Judgment',
  'Compensation',
  'Rehabilitation',
  'Closure',
];

export const IndividualCaseProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    getCaseById,
    loadCaseById,
    openReasoningDrawer,
    openInterventionModal,
    setShowCheckInSimulator,
    isDemoMode,
    userRole,
    staffDirectory,
    assignCounsellorToCase,
    transitionCaseStage,
    isMutating,
  } = useApp();

  const caseItem = getCaseById(id ?? '');
  const [isCaseLoading, setIsCaseLoading] = useState(Boolean(id));

  const [selectedTrajectoryMetric, setSelectedTrajectoryMetric] = useState<
    'distressScore' | 'engagementScore' | 'sentimentScore' | 'threatSignalScore'
  >('distressScore');

  const [selectedTimelineStage, setSelectedTimelineStage] = useState<CaseStage | null>(null);
  const [selectedCounsellorId, setSelectedCounsellorId] = useState('');
  const [stageEvidence, setStageEvidence] = useState('');

  useEffect(() => {
    if (!id) {
      setIsCaseLoading(false);
      return;
    }
    let active = true;
    setIsCaseLoading(true);
    void loadCaseById(id).finally(() => {
      if (active) setIsCaseLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id, loadCaseById]);

  if (isCaseLoading && !caseItem) {
    return <div role="status" className="p-8 text-center text-sm text-slate-600">Loading case record…</div>;
  }

  if (!caseItem) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Case Record Not Found</h2>
        <p className="text-xs text-slate-500">The requested case identification could not be located.</p>
        <button
          onClick={() => navigate('/cases')}
          className="px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 text-white"
        >
          Return to Monitoring Register
        </button>
      </div>
    );
  }

  const c = caseItem;
  const creationNotice = typeof (location.state as { notice?: unknown } | null)?.notice === 'string'
    ? (location.state as { notice: string }).notice
    : '';
  const sevenDayChange = c.distressScore - c.previousDistressScore;
  const trajectoryHighlights = c.longitudinalTrajectory.slice(-3);
  const latestInteraction = c.interactions[0];
  const latestThreatKeywords = latestInteraction?.threatKeywords ?? [];
  const canManageCase = userRole !== 'Counsellor';
  const currentStageIndex = CASE_STAGE_SEQUENCE.indexOf(c.currentStage);
  const nextStage = currentStageIndex >= 0
    ? CASE_STAGE_SEQUENCE[currentStageIndex + 1]
    : undefined;
  const assignableCounsellors = staffDirectory.filter((staff) =>
    staff.role === 'COUNSELLOR'
    && staff.district_name === c.district
  );

  const handleCounsellorAssignment = async (): Promise<void> => {
    if (!selectedCounsellorId) return;
    const saved = await assignCounsellorToCase(c.id, selectedCounsellorId);
    if (saved) setSelectedCounsellorId('');
  };

  const handleStageTransition = async (): Promise<void> => {
    if (!nextStage || !stageEvidence.trim()) return;
    const saved = await transitionCaseStage(c.id, nextStage, stageEvidence);
    if (saved) setStageEvidence('');
  };

  // Longitudinal trajectory custom tooltip
  const TrajectoryTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: LongitudinalDataPoint = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-800 text-xs max-w-xs space-y-1.5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <span className="font-bold text-indigo-300">{data.date} ({data.weekLabel || 'Pulse'})</span>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
              Stage: {data.caseStage}
            </span>
          </div>
          <div className="flex items-center justify-between font-semibold">
            <span className="text-slate-400">Distress Score:</span>
            <span className={`font-mono text-sm ${data.distressScore >= 70 ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
              {data.distressScore}/100
            </span>
          </div>
          {data.detectedSignal && (
            <div className="p-1.5 rounded bg-indigo-950/80 border border-indigo-500/30 text-[11px] text-indigo-200">
              <span className="block text-[9px] uppercase font-bold text-indigo-400">Detected Signal:</span>
              {data.detectedSignal}
            </div>
          )}
          {data.notes && <p className="text-[10px] text-slate-400 italic mt-1">{data.notes}</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {creationNotice && (
        <div role="status" aria-live="polite" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
          {creationNotice}
        </div>
      )}
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/cases')}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            title="Back to Cases"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk']">
                Case {c.id}
              </h1>
              <RiskBadge level={c.riskLevel} size="md" showPulse />
              <PriorityBadge priority={c.priority} />
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Subject: <strong className="text-slate-700">{c.victimAnonymousId}</strong> ({c.subjectRole}) • {c.caseType} • {c.district} District
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => openReasoningDrawer(c)}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Explain AI Signals</span>
          </button>

          <button
            onClick={() => openInterventionModal(c)}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Intervention</span>
          </button>
        </div>
      </div>

      {/* Case Header Information Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Anonymous Identity
            </span>
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-emerald-600" />
              {c.victimAnonymousId}
            </span>
            <span className="text-[10px] text-slate-500">Protected case identifier</span>
          </div>

          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Case Type & Law
            </span>
            <span className="font-bold text-slate-900">{c.caseType}</span>
            <span className="text-[10px] text-slate-500">Classification from the case API</span>
          </div>

          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              District Jurisdiction
            </span>
            <span className="font-bold text-slate-900 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-indigo-600" />
              {c.district}, {c.state}
            </span>
            <span className="text-[10px] text-slate-500">Authorized jurisdiction</span>
          </div>

          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Current Case Stage
            </span>
            <StageBadge stage={c.currentStage} isCurrent />
          </div>

          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Assigned Counsellor
            </span>
            <span className="font-bold text-slate-900 truncate block">{c.assignedCounsellor}</span>
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <Phone className="w-2.5 h-2.5" /> {c.counsellorPhone || 'Contact not provided'}
            </span>
          </div>

          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Monitoring Status
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-bold text-amber-700 bg-amber-50 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {c.monitoringStatus}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Last Pulse: {c.lastInteractionTime}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-indigo-600" />
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Legal intake details</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-3">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">FIR number</span>
            <span className="mt-1 block font-bold text-slate-900">{c.firNumber || 'Not recorded'}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Police station</span>
            <span className="mt-1 block font-bold text-slate-900">{c.policeStation || 'Not recorded'}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Special court</span>
            <span className="mt-1 block font-bold text-slate-900">{c.specialCourt || 'Not recorded'}</span>
          </div>
        </div>
      </div>

      {canManageCase && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4">
          <div className="space-y-2">
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Verified counsellor assignment</h2>
              <p className="text-[11px] text-slate-500">Only active counsellor identities returned for this jurisdiction can be selected.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedCounsellorId}
                onChange={(event) => setSelectedCounsellorId(event.target.value)}
                disabled={isMutating || assignableCounsellors.length === 0}
                className="min-h-10 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-xs disabled:opacity-60"
              >
                <option value="">{assignableCounsellors.length > 0 ? 'Select counsellor' : 'No counsellor available on loaded staff page'}</option>
                {assignableCounsellors.map((staff) => (
                  <option key={staff.id} value={staff.id}>{staff.display_name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => void handleCounsellorAssignment()}
                disabled={!selectedCounsellorId || isMutating}
                className="min-h-10 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white disabled:bg-indigo-300 disabled:cursor-not-allowed"
              >
                Assign
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Evidence-backed stage transition</h2>
              <p className="text-[11px] text-slate-500">{nextStage ? `The only valid next stage is ${nextStage}.` : 'This case is at its terminal stage.'}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <textarea
                value={stageEvidence}
                onChange={(event) => setStageEvidence(event.target.value)}
                rows={2}
                maxLength={2000}
                disabled={!nextStage || isMutating}
                placeholder="Record the verified evidence for this transition"
                className="min-h-10 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => void handleStageTransition()}
                disabled={!nextStage || !stageEvidence.trim() || isMutating}
                className="min-h-10 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white disabled:bg-emerald-300 disabled:cursor-not-allowed"
              >
                {nextStage ? `Advance to ${nextStage}` : 'Closed'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Row: Dynamic Distress Score (Gauge & Longitudinal Trajectory) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Dynamic Distress Score Gauge Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <DistressScoreGauge
            score={c.distressScore}
            previousScore={c.previousDistressScore}
            baselineScore={c.baselineScore}
            sevenDayChange={sevenDayChange}
            riskLevel={c.riskLevel}
            trendText={c.trend}
          />

          {/* Explainability Mini Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Why is this case currently {c.riskLevel} risk?
              </h3>
              <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded border border-rose-200">
                {sevenDayChange >= 0 ? '+' : ''}{sevenDayChange} pts (7d)
              </span>
            </div>

            <div className="space-y-2">
              {c.contributingFactors.slice(0, 4).map((factor) => (
                <div key={factor.id} className="flex items-center justify-between text-xs p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-700">{factor.factor}</span>
                  <span className="font-bold font-mono text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                    +{factor.points}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 text-white text-[11px]">
              <span className="text-indigo-300 font-bold block mb-0.5">Primary Factor:</span>
              <span>{c.primaryContributingFactor || 'No primary factor was supplied by the API.'}</span>
            </div>

            <button
              onClick={() => openReasoningDrawer(c)}
              className="w-full py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              View Full Explainable AI Reasoning
            </button>
          </div>
        </div>

        {/* Right: Longitudinal Trend Analysis / Wellbeing Trajectory (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    Wellbeing Trajectory & Longitudinal Trend Analysis
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hover over points to inspect detected signals, dates, and corresponding legal stages.
                </p>
              </div>

              {/* Metric Selector Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto overflow-x-auto">
                <button
                  onClick={() => setSelectedTrajectoryMetric('distressScore')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    selectedTrajectoryMetric === 'distressScore'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Distress (0-100)
                </button>
                <button
                  onClick={() => setSelectedTrajectoryMetric('engagementScore')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    selectedTrajectoryMetric === 'engagementScore'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Engagement %
                </button>
                <button
                  onClick={() => setSelectedTrajectoryMetric('threatSignalScore')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    selectedTrajectoryMetric === 'threatSignalScore'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Threat Signals
                </button>
              </div>
            </div>

            {/* Trajectory Milestone Markers Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 mb-2 border-y border-slate-100 text-xs">
              {trajectoryHighlights.length > 0 ? trajectoryHighlights.map((point) => (
                <div key={`${point.date}-${point.distressScore}`} className="p-2 rounded bg-slate-50 border border-slate-200/60">
                  <span className="font-bold text-slate-700 block">
                    {point.date || 'Date unavailable'} • Distress: {point.distressScore}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {point.detectedSignal ? `Signal: ${point.detectedSignal}` : 'No detected signal supplied.'}
                  </span>
                </div>
              )) : (
                <div className="sm:col-span-3 p-3 rounded bg-slate-50 border border-slate-200 text-slate-500">
                  No longitudinal observations were returned by the API.
                </div>
              )}
            </div>
          </div>

          {/* Recharts Longitudinal Trajectory Line */}
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={c.longitudinalTrajectory} margin={{ top: 15, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" domain={[0, 100]} />
                <Tooltip content={<TrajectoryTooltip />} />
                <ReferenceLine y={80} stroke="#e11d48" strokeDasharray="3 3" label={{ value: 'Critical (80+)', fill: '#e11d48', fontSize: 10 }} />
                <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'High (60+)', fill: '#f59e0b', fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey={selectedTrajectoryMetric}
                  name="Trajectory"
                  stroke="#4f46e5"
                  strokeWidth={3.5}
                  dot={{ r: 5, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 8, fill: '#e11d48' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Recorded baseline: {c.baselineScore}/100</span>
            <span className={`font-semibold ${sevenDayChange > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
              7-day change: {sevenDayChange >= 0 ? '+' : ''}{sevenDayChange} points
            </span>
          </div>
        </div>
      </div>

      {/* Multimodal Monitoring Signals (4 Cards) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Multi-Modal Monitoring Signals
            </h3>
            <p className="text-xs text-slate-500">
              Latest case-level monitoring signals returned by the configured API.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            Decision-support signals — human review required
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Text Analysis */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-500">Text Analysis</span>
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Sentiment:</span>
                <strong className="text-rose-600 font-bold">{c.textSentiment}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Distress Language:</span>
                <strong className="text-rose-600">{c.distressLanguageStatus}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Keywords:</span>
                <span className="text-slate-800 font-mono text-[11px]">
                  {latestThreatKeywords.length > 0 ? latestThreatKeywords.join(', ') : 'Not provided by API'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Voice Analysis */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-500">Voice Analysis</span>
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Mic className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Voice Stress:</span>
                <strong className="text-amber-600 font-bold">{c.voiceStressStatus}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Emotion Signal:</span>
                <strong className="text-amber-700">{c.emotionSignal}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Acoustic Tremors:</span>
                <span className="text-slate-800 font-semibold">Not provided by API</span>
              </div>
            </div>
          </div>

          {/* 3. Behavioural Pattern */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-500">Behavioural Pattern</span>
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Engagement Rate:</span>
                <strong className="text-rose-600 font-bold">{c.engagementRateChange}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Missed Follow-ups:</span>
                <strong className="text-rose-600">{c.missedFollowUps} Unanswered</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Pulse Adherence:</span>
                <span className="text-slate-800 font-semibold">Not provided by API</span>
              </div>
            </div>
          </div>

          {/* 4. Interaction Pattern */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-500">Interaction Pattern</span>
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Response Cadence:</span>
                <strong className="text-amber-600 font-bold">{c.responseFrequency}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Last Interaction:</span>
                <strong className="text-slate-800">{c.lastInteractionTime}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Preferred Channel:</span>
                <span className="text-slate-800 font-semibold">
                  {latestInteraction?.channel || 'Not provided by API'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns: Recommended Interventions vs Alert Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recommended Interventions (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Recommended Multi-Agency Interventions
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                AI decision-support suggestions mapped to statutory schemes (Counselling, Witness Protection, Relief).
              </p>
            </div>

            <button
              onClick={() => openInterventionModal(c)}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 cursor-pointer"
            >
              + New Action
            </button>
          </div>

          <div className="space-y-3">
            {c.interventions.map((inv) => (
              <div
                key={inv.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all text-xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                      {inv.type}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{inv.title}</h4>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <PriorityBadge priority={inv.priority} />
                    <StatusBadge status={inv.status} />
                  </div>
                </div>

                <p className="text-slate-600 leading-relaxed">{inv.reason}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                  <span className="text-slate-500">
                    Assigned: <strong className="text-slate-800">{inv.assignedTo}</strong> ({inv.assignedRole})
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openInterventionModal(c, inv)}
                      className="px-2.5 py-1 rounded font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 transition-colors cursor-pointer"
                    >
                      {inv.status === 'Completed' ? 'View completed record' : 'Assign / update workflow'}
                    </button>
                    {inv.status === 'Completed' && (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Alert Timeline (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Case Alert Timeline
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Recorded case events returned by the configured API.
              </p>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              API records
            </span>
          </div>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {c.alertTimeline.map((ev) => (
              <div key={ev.id} className="relative text-xs space-y-0.5">
                <span
                  className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                    ev.severity === 'critical'
                      ? 'bg-rose-600'
                      : ev.severity === 'warning'
                      ? 'bg-amber-500'
                      : ev.severity === 'success'
                      ? 'bg-emerald-500'
                      : 'bg-indigo-600'
                  }`}
                />
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>{ev.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{ev.time}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{ev.description}</p>
              </div>
            ))}
          </div>

          {isDemoMode && <button
            onClick={() => setShowCheckInSimulator(true)}
            className="w-full py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Simulate New Interaction & Update Timeline
          </button>}
        </div>
      </div>

      {/* Case Lifecycle Horizontal Stage Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Complete Atrocity Case Lifecycle & Wellbeing Continuity
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Demonstrates that mental wellbeing is continuously monitored throughout every legal and rehabilitative milestone.
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
            Current: {c.currentStage}
          </span>
        </div>

        {/* Horizontal Process Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {c.milestones.map((m, idx) => {
            const isCurrent = m.isCurrent;
            const isCompleted = m.completed;

            return (
              <div
                key={m.stage}
                onClick={() => setSelectedTimelineStage(m.stage)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-500/30'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                      isCurrent
                        ? 'bg-white/20 text-white'
                        : isCompleted
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    Step {idx + 1}
                  </span>
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  {isCurrent && <span className="w-2 h-2 rounded-full bg-white animate-ping" />}
                </div>

                <h4 className="text-xs font-bold truncate mb-1">{m.stage}</h4>
                <p className={`text-[10px] line-clamp-1 ${isCurrent ? 'text-indigo-100' : 'text-slate-500'}`}>
                  {m.title}
                </p>
                <span
                  className={`text-[9px] font-mono block mt-1.5 ${
                    isCurrent ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  {m.date}
                </span>
              </div>
            );
          })}
        </div>

        {/* Selected / Current Stage Details Card */}
        {(() => {
          const activeStageObj =
            c.milestones.find((m) => m.stage === (selectedTimelineStage || c.currentStage)) ||
            c.milestones[0];

          if (!activeStageObj) {
            return (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                The case is currently at <strong>{c.currentStage}</strong>. No detailed lifecycle milestone records are available for this case yet.
              </div>
            );
          }

          return (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{activeStageObj.stage} Stage Overview</span>
                  <span className="text-[11px] text-slate-500">({activeStageObj.title})</span>
                </div>
                <span className="text-xs font-bold text-indigo-700">Distress Trend: {activeStageObj.distressTrend}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Key Legal Events</span>
                  <ul className="list-disc list-inside text-slate-700 space-y-0.5 mt-1 font-medium">
                    {activeStageObj.importantEvents.length > 0 ? (
                      activeStageObj.importantEvents.map((ev, i) => <li key={i}>{ev}</li>)
                    ) : (
                      <li className="text-slate-400 italic">No formal stage events logged.</li>
                    )}
                  </ul>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Active Support Interventions</span>
                  <ul className="list-disc list-inside text-slate-700 space-y-0.5 mt-1 font-medium">
                    {activeStageObj.interventions.length > 0 ? (
                      activeStageObj.interventions.map((inv, i) => <li key={i}>{inv}</li>)
                    ) : (
                      <li className="text-slate-400 italic">No active interventions in this stage.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
