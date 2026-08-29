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
import { useApp } from '../context/AppContext';

export const PrivacySecurityPage: React.FC = () => {
  const { auditLogs, usesMockApi } = useApp();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <h1 className="text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk']">
              Privacy & Security Readiness
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Current implementation notes and API activity records. This page is not a security certification or legal compliance attestation.
          </p>
        </div>

        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
          <ShieldCheck className="w-4 h-4" /> Independent compliance review pending
        </span>
      </div>

      {/* 4 Security Architecture Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 w-fit">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Pseudonymous Case Identifiers</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            The current case model exposes anonymous subject identifiers. End-to-end PII discovery, retention, and deletion controls still require verification.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 w-fit">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Transport & Storage Controls</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            HTTPS, database encryption, key management, backups, and rotation are deployment responsibilities and are not verified by this prototype UI.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 w-fit">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Role-Based Access Control (RBAC)</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            The backend scopes case queries by authenticated role and jurisdiction. Permission tests and a production authorization review remain required.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 w-fit">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Audit Records</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            The API returns operational audit records. Cryptographic signing, append-only storage, and tamper-evidence are not implemented or certified here.
          </p>
        </div>
      </div>

      {/* API activity log table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              API Activity Records
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {usesMockApi ? 'Explicit demo-mode records; no external actions occurred.' : 'Records returned by the configured backend; not a tamper-evident ledger.'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
              <tr>
                <th className="py-3 px-4">Log ID</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Role / Actor</th>
                <th className="py-3 px-3">Action Executed</th>
                <th className="py-3 px-3">Resource</th>
                <th className="py-3 px-3">Recorded Network Value</th>
                <th className="py-3 px-4 text-right">Record Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{log.id}</td>
                  <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">{log.timestamp}</td>
                  <td className="py-3.5 px-3 font-semibold text-slate-900">{log.userName} ({log.userRole})</td>
                  <td className="py-3.5 px-3">{log.action}</td>
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-800">{log.caseId || 'General'}</td>
                  <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">{log.ipAddress}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
              {auditLogs.length === 0 && (
                <tr><td colSpan={7} className="py-8 px-4 text-center text-slate-500">No audit records were returned by the API.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
