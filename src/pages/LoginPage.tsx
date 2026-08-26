import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  User,
  Building2,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login, userRole, setUserRole } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('officer.patil@pune.gov.in');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState<UserRole>('District Officer');

  const roles: { role: UserRole; title: string; desc: string; sampleId: string }[] = [
    {
      role: 'District Officer',
      title: 'District Case Officer',
      desc: 'District-level monitoring, emergency triage & protection orders',
      sampleId: 'officer.patil@pune.gov.in',
    },
    {
      role: 'Counsellor',
      title: 'Clinical Counsellor',
      desc: 'Psycho-social assessments, trauma interventions & therapeutic notes',
      sampleId: 'dr.deshmukh@counselling.gov.in',
    },
    {
      role: 'State Administrator',
      title: 'State Administrator',
      desc: 'Cross-district oversight, SLA compliance & welfare scheme allocation',
      sampleId: 'admin.sharma@maharashtra.gov.in',
    },
    {
      role: 'National Administrator',
      title: 'National Director (MoSJE)',
      desc: 'Aggregated intelligence, policy insights & national trend analytics',
      sampleId: 'director.ramachandran@mosje.gov.in',
    },
  ];

  const handleRoleSelect = (r: UserRole, sampleId: string) => {
    setSelectedRole(r);
    setUserRole(r);
    setEmail(sampleId);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedRole);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Government Emblem Banner */}
      <div className="bg-slate-950/80 border-b border-slate-800 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-sm">
              सा
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider text-slate-200 uppercase block">
                Ministry of Social Justice and Empowerment
              </span>
              <span className="text-[10px] text-slate-400">
                Department of Social Justice and Empowerment • Government of India
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>NIC Cloud Authenticated • 256-Bit SSL</span>
          </div>
        </div>
      </div>

      {/* Main Login Body */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left info column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                Smart India Hackathon Problem Statement 26094
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-['Space_Grotesk'] leading-tight">
                SAATHI
              </h1>
              <p className="text-base text-indigo-200 font-semibold">
                AI-Powered Dynamic Mental Health Monitoring and Distress Prediction System for Victims of Atrocities
              </p>
              <p className="text-xs text-slate-400 italic">
                "Continuous support. Early intervention. Human-centered care."
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Dynamic Distress Scoring:</strong> Multi-modal tracking across text, voice acoustics, engagement frequency, and behavioral patterns.
                </span>
              </div>
              <div className="flex items-start gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Explainable AI Early Warnings:</strong> Transparent additive factor attributions (+18, +14) with mandatory human review workflows.
                </span>
              </div>
              <div className="flex items-start gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Full Case Lifecycle Care:</strong> Continuous wellbeing tracking from FIR complaint through court trial to final socio-economic rehabilitation.
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              <Info className="w-4 h-4 text-indigo-400 inline mr-1 -mt-0.5" />
              <strong>Ethical AI Guardrail:</strong> System outputs are decision-support signals and <em>not clinical diagnoses</em>. Final decisions remain with authorized personnel.
            </div>
          </div>

          {/* Right Login Card */}
          <div className="lg:col-span-6">
            <div className="bg-slate-950/90 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Official Portal Sign In
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Select a government role to test the interactive dashboard.
                </p>
              </div>

              {/* Role Picker Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Select Role Persona (Demo Mode)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {roles.map((r) => {
                    const isSelected = selectedRole === r.role;
                    return (
                      <div
                        key={r.role}
                        onClick={() => handleRoleSelect(r.role, r.sampleId)}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-600/30 border-indigo-400 ring-2 ring-indigo-500/50'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span className="block text-xs font-bold text-white">{r.title}</span>
                        <span className="block text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {r.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Official ID / Government Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password / Digital Token
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 text-center font-medium">
                  Authorized Government Personnel Only (Demo Active)
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Sign In as {selectedRole}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-2 border-t border-slate-800 text-center">
                <p className="text-[10px] text-slate-500">
                  Protected under the Information Technology Act & DPDP Act 2023. Unauthorized access is punishable by law.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-950 border-t border-slate-800/80 px-6 py-3 text-center text-xs text-slate-500">
        SAATHI Atrocity Victim Wellbeing Platform • Smart India Hackathon Prototype 2026 • Ministry of Social Justice and Empowerment
      </div>
    </div>
  );
};
