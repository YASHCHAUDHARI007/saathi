import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface AdvisoryNoticeProps {
  compact?: boolean;
  className?: string;
}

export const AdvisoryNotice: React.FC<AdvisoryNoticeProps> = ({ compact = false, className = '' }) => {
  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/90 border border-slate-200/80 text-[11px] text-slate-600 ${className}`}>
        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
        <span>
          <strong>AI Decision Support System</strong> — All risk scores are advisory and require authorized human review. Not a clinical diagnosis.
        </span>
      </div>
    );
  }

  return (
    <div className={`p-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-slate-200 border border-slate-800 shadow-xs ${className}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-200">
              Government Decision-Support & Non-Clinical Advisory
            </h4>
            <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-1.5 py-0.5 rounded font-mono">
              MoSJE PS-26094
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            SAATHI provides longitudinal distress indicators and early escalation warnings to aid human case officers. <strong>AI predictions do not constitute medical or psychiatric diagnoses.</strong> Final intervention, safety, and rehabilitation decisions remain solely with authorized government officers, counsellors, and judicial authorities.
          </p>
        </div>
      </div>
    </div>
  );
};
