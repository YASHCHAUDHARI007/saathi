import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Building2,
  CheckCircle2,
  Share2,
  Filter,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';

export const ReportsPage: React.FC = () => {
  const { isDemoMode } = useApp();
  const [selectedReportType, setSelectedReportType] = useState('monthly_summary');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExport = (format: 'PDF' | 'CSV') => {
    if (!isDemoMode) return;
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      setTimeout(() => setExportSuccess(false), 3000);
    }, 800);
  };

  if (!isDemoMode) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-center space-y-3">
        <FileText className="w-8 h-8 text-indigo-600 mx-auto" />
        <h1 className="text-lg font-extrabold text-slate-900">Report exports are not configured</h1>
        <p className="text-xs text-slate-600 max-w-xl mx-auto">
          The frontend does not yet have a server-side report job, signed download, or integrity-verification API. No official dossier can be generated from this deployment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h1 className="text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk']">
              Demonstration Report Templates
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Preview illustrative layouts in explicit demo mode. These are not official, certified, or compliance-ready exports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('PDF')}
            disabled={isExporting}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Run Demo PDF Export</span>
          </button>
          <button
            onClick={() => handleExport('CSV')}
            disabled={isExporting}
            className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {exportSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-3 text-xs font-semibold shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Demo export animation complete. No official file or cryptographic integrity seal was generated.
          </span>
        </div>
      )}

      {/* Report Customization Form & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Controls (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Report Parameters
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Report Template</label>
            <select
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium"
            >
              <option value="monthly_summary">Monthly Victim Wellbeing & Distress Summary</option>
              <option value="witness_protection">Witness Protection & Threat Assessment Audit</option>
              <option value="trial_correlation">Court Trial Hearing Mental Strain Correlation</option>
              <option value="rehabilitation_sla">Rehabilitation & Compensation Disbursement SLA</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Jurisdiction Scope</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium"
            >
              <option value="All">All Maharashtra Districts (36 Districts)</option>
              <option value="Pune">Pune District Only</option>
              <option value="Nagpur">Nagpur District Only</option>
              <option value="Nashik">Nashik District Only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Reporting Period</label>
            <select className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium">
              <option>Current Fiscal Quarter (Q2 FY 2026-27)</option>
              <option>August 2026 (Monthly)</option>
              <option>Year-to-Date (FY 2026-27)</option>
            </select>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-900 block">Prototype Notice:</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Placeholder content only. Privacy, redaction, retention, and statutory review are required before report generation is enabled.
            </p>
          </div>
        </div>

        {/* Right: Live Interactive Document Preview (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6 font-sans">
          {/* Illustrative template header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                ILLUSTRATIVE PROTOTYPE • NOT AN OFFICIAL GOVERNMENT DOCUMENT
              </span>
              <h2 className="text-base font-extrabold text-slate-900 font-['Space_Grotesk']">
                SAATHI ATROCITY VICTIM DYNAMIC WELLBEING STATUS DOSSIER
              </h2>
              <p className="text-xs text-slate-600 font-mono">
                Sample Ref: SAATHI-DEMO-094 • Placeholder date and figures
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
              सा
            </div>
          </div>

          {/* Executive Table In Document */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-200 pb-1">
              1. Executive Statistical Digest
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Monitored</span>
                <span className="text-lg font-bold text-slate-900">1,284 Cases</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Average Distress</span>
                <span className="text-lg font-bold text-indigo-700">56.4 / 100</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">High/Critical Alerts</span>
                <span className="text-lg font-bold text-rose-600">42 Flagged</span>
              </div>
            </div>

            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-200 pb-1 pt-2">
              2. Key Vulnerability Findings
            </h4>
            <p className="text-slate-700 leading-relaxed">
              • <strong>Illustrative narrative:</strong> This demo layout uses fictional trend and intervention figures to show where a validated longitudinal finding could appear. No effectiveness claim has been established by this prototype.
            </p>
            <p className="text-slate-700 leading-relaxed">
              • <strong>Witness Protection Efficacy:</strong> 48 statutory protection orders issued under WPS 2018 with zero reported breaches in monitored zones.
            </p>

            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-200 pb-1 pt-2">
              3. Officer Authorization & Audit Sign-Off
            </h4>
            <div className="flex justify-between items-end pt-4 text-[11px] text-slate-600">
              <div>
                <span>Generated by: <strong>District Social Justice Directorate</strong></span>
                <span className="block font-mono text-slate-400">Hash: 8f4b29c9...2a1b9</span>
              </div>
              <div className="text-right">
                <div className="w-32 border-b border-slate-400 mb-1" />
                <span className="font-semibold">Authorized Signatory</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
