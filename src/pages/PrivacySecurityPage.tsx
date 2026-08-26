import React from 'react';
import {
  Shield,
  Lock,
  EyeOff,
  FileCheck2,
  Key,
  ShieldCheck,
  Server,
  UserCheck,
  AlertCircle,
} from 'lucide-react';

export const PrivacySecurityPage: React.FC = () => {
  const auditLogs = [
    {
      id: 'AUD-8910',
      timestamp: 'Today, 10:35:12 AM',
      officer: 'District Officer (Pune)',
      action: 'Reviewed Explainable AI Factor Weights',
      resource: 'Case ATC-2026-10482',
      ip: '10.14.82.109 (NIC VPN)',
      status: 'VERIFIED',
    },
    {
      id: 'AUD-8909',
      timestamp: 'Today, 10:32:44 AM',
      officer: 'Clinical Counsellor (Trauma)',
      action: 'Scheduled In-Person Trauma Counselling',
      resource: 'Case ATC-2026-10482',
      ip: '10.14.82.114 (NIC VPN)',
      status: 'VERIFIED',
    },
    {
      id: 'AUD-8908',
      timestamp: 'Today, 10:29:01 AM',
      officer: 'System Daemon (SAATHI Engine)',
      action: 'Ingested Chatbot Check-in & Recalculated Distress (72 -> 82)',
      resource: 'Case ATC-2026-10482',
      ip: '127.0.0.1 (Local Core)',
      status: 'AUTO-SIGNED',
    },
    {
      id: 'AUD-8907',
      timestamp: 'Today, 09:15:33 AM',
      officer: 'State Administrator (MH)',
      action: 'Generated Monthly Atrocity Wellbeing PDF Report',
      resource: 'Statewide Digest',
      ip: '10.20.10.45 (NIC VPN)',
      status: 'VERIFIED',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <h1 className="text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk']">
              Privacy, Anonymity & Statutory Security Framework
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Strict compliance with Digital Personal Data Protection (DPDP) Act 2023 and Section 15A of SC/ST (PoA) Act.
          </p>
        </div>

        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
          <ShieldCheck className="w-4 h-4" /> 100% DPDP 2023 Compliant
        </span>
      </div>

      {/* 4 Security Architecture Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 w-fit">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Zero-PII Pseudonymization</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Real citizen names, Aadhaar numbers, and exact residential addresses are stripped at ingestion. Only cryptographic tokens (e.g. #V-10482) are processed by AI.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 w-fit">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">AES-256 Envelope Encryption</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            All multi-modal check-ins, audio acoustic features, and psychological assessments are encrypted at rest and in transit via NIC KMS HSM.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 w-fit">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Role-Based Access Control (RBAC)</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Strict compartmentalization ensures counsellors only see psychological histories while police protection officers only receive threat vectors.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 w-fit">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Immutable Audit Trail</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every file inspection, AI reasoning review, and intervention scheduling action is cryptographically signed and logged for judicial audits.
          </p>
        </div>
      </div>

      {/* Immutable Access Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Judicial & Regulatory Access Audit Trail
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live tamper-evident ledger tracking all officer interactions with case dossiers.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
              <tr>
                <th className="py-3 px-4">Log ID</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Official Role / Actor</th>
                <th className="py-3 px-3">Action Executed</th>
                <th className="py-3 px-3">Target Case Dossier</th>
                <th className="py-3 px-3">IP / Network Channel</th>
                <th className="py-3 px-4 text-right">Integrity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{log.id}</td>
                  <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">{log.timestamp}</td>
                  <td className="py-3.5 px-3 font-semibold text-slate-900">{log.officer}</td>
                  <td className="py-3.5 px-3">{log.action}</td>
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-800">{log.resource}</td>
                  <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">{log.ip}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {log.status}
                    </span>
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
