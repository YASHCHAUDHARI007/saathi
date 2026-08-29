import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  Brain,
  MessageSquare,
  Mic,
  Activity,
  Calendar,
  AlertOctagon,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RiskBadge } from './RiskBadge';

export const AiReasoningDrawer: React.FC = () => {
  const { activeReasoningCase, closeReasoningDrawer, userRole, isDemoMode } = useApp();
  const [officerReviewNotes, setOfficerReviewNotes] = useState('');
  const [reviewedSuccess, setReviewedSuccess] = useState(false);

  if (!activeReasoningCase) return null;

  const c = activeReasoningCase;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDemoMode) return;
    setReviewedSuccess(true);
    setTimeout(() => {
      setReviewedSuccess(false);
      closeReasoningDrawer();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div
        className="w-full max-w-2xl bg-white h-full min-h-screen shadow-2xl flex flex-col border-l border-slate-200 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Explainable AI Reasoning</h3>
                <span className="text-xs bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded font-mono">
                  SHAP / Attribution
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Case: <span className="font-semibold text-white">{c.id}</span> • {c.victimAnonymousId}
              </p>
            </div>
          </div>

          <button
            onClick={closeReasoningDrawer}
            className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-6 space-y-6 flex-1 text-slate-800">
          {/* Question Banner */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 mt-0.5">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-amber-900">
                  Why is this case currently evaluated as{' '}
                  <span className="underline decoration-amber-500 underline-offset-2">{c.riskLevel} RISK</span>?
                </h4>
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                  Dynamic Distress Score: <strong className="text-amber-950">{c.distressScore} / 100</strong> (
                  {c.trend}). Multi-modal signal analysis detected abnormal risk velocity.
                </p>
              </div>
            </div>
          </div>

          {/* Primary Factor Highlight */}
          <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800">
            <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block mb-1">
              Primary Contributing Factor
            </span>
            <p className="text-sm font-semibold text-slate-100 leading-snug">
              "{c.primaryContributingFactor}"
            </p>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {c.aiExplanationSummary}
            </p>
          </div>

          {/* Explainable Factor Weights breakdown (SHAP) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Contributing Signals & Factor Weights
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">Additive attribution model</span>
            </div>

            <div className="space-y-2.5">
              {c.contributingFactors.map((f) => {
                const isPositive = f.points > 0;
                const percent = Math.min(100, Math.abs(f.points) * 4.5);

                return (
                  <div
                    key={f.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-800">{f.factor}</span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${
                          isPositive
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isPositive ? `+${f.points}` : f.points} pts
                      </span>
                    </div>

                    <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full ${
                          isPositive ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-600 leading-normal">{f.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Multi-modal Evidence Provenance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Multi-Modal Evidence Provenance
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                  NLP Text Analysis
                </div>
                <p className="text-xs text-slate-600">
                  Sentiment: <strong className="text-rose-600">{c.textSentiment}</strong>
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Distress vocabulary: {c.distressLanguageStatus}
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1">
                  <Mic className="w-3.5 h-3.5 text-indigo-600" />
                  Voice Acoustic Analysis
                </div>
                <p className="text-xs text-slate-600">
                  Voice Stress: <strong className="text-amber-600">{c.voiceStressStatus}</strong>
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Emotion signal: {c.emotionSignal}
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1">
                  <Activity className="w-3.5 h-3.5 text-indigo-600" />
                  Engagement Pattern
                </div>
                <p className="text-xs text-slate-600">
                  Trend: <strong className="text-rose-600">{c.engagementRateChange}</strong>
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Missed follow-ups: {c.missedFollowUps}
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  Case Stage Correlation
                </div>
                <p className="text-xs text-slate-600">
                  Stage: <strong>{c.currentStage}</strong>
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Last check-in: {c.lastInteractionTime}
                </p>
              </div>
            </div>
          </div>

          {/* Mandatory Human Review Form */}
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-indigo-700" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                Authorized Human Review Sign-off
              </h4>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              {isDemoMode
                ? `Demo workflow for a ${userRole} to review the displayed factors. No server audit record is created.`
                : 'Human-review persistence is not configured. This form is read-only until an audited backend endpoint is available.'}
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <textarea
                value={officerReviewNotes}
                onChange={(e) => setOfficerReviewNotes(e.target.value)}
                placeholder="Enter review notes (e.g. Verified threat with local protection officer; scheduled in-person trauma counselling session)..."
                rows={2}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" /> {isDemoMode ? 'Local demo note only' : 'Server persistence pending'}
                </span>

                <button
                  type="submit"
                  disabled={reviewedSuccess || !isDemoMode}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {reviewedSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> Demo Note Captured
                    </>
                  ) : (
                    isDemoMode ? 'Capture Demo Review Note' : 'Review API Not Configured'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Ethical Disclaimer Footer */}
          <div className="text-[11px] text-slate-500 bg-slate-100 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>Advisory Notice:</strong> This AI explanation is formulated via multi-modal longitudinal signal attribution. It is designed to assist, not replace, authorized human decision-makers. No automated punitive or clinical decision is taken without human authorization.
          </div>
        </div>
      </div>
    </div>
  );
};
