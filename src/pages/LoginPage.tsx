import React, { useEffect, useState } from 'react';
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
  const { login, demoLogin, userRole, isDemoMode, isAuthLoading, isAuthenticated } = useApp();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('District Officer');
  const [loginError, setLoginError] = useState<string | null>(null);

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
      desc: 'Cross-district oversight, response review & welfare planning',
      sampleId: 'admin.sharma@maharashtra.gov.in',
    },
    {
      role: 'National Administrator',
      title: 'National Director (MoSJE)',
      desc: 'Aggregated intelligence, policy insights & national trend analytics',
      sampleId: 'director.ramachandran@mosje.gov.in',
    },
    {
      role: 'Victim / Citizen',
      title: 'Victim / Citizen (Anjali)',
      desc: 'Confidential care portal, SOS threat alarm, DBT tracker & vernacular check-ins',
      sampleId: 'anjali.gaikwad@citizen.nic.in',
    },
  ];

  useEffect(() => {
    if (isAuthenticated) navigate(userRole === 'Victim / Citizen' ? '/victim' : '/dashboard', { replace: true });
  }, [isAuthenticated, navigate, userRole]);

  const handleRoleSelect = (r: UserRole) => {
    setSelectedRole(r);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      await login(username, password);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Sign in failed. Please try again.');
    }
  };

  const handleDemoSignIn = async () => {
    setLoginError(null);
    try {
      await demoLogin(selectedRole);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Demo sign in failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Prototype identity banner */}
      <div className="bg-slate-950/80 border-b border-slate-800 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-sm">
              सा
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider text-slate-200 uppercase block">
                SAATHI Victim Wellbeing Prototype
              </span>
              <span className="text-[10px] text-slate-400">
                Demonstration project • Not an official government deployment
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Deployment security review pending</span>
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
                  SAATHI API Sign In
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Use credentials issued by the configured SAATHI backend.
                </p>
              </div>

              {/* Demo personas are compiled into explicitly enabled demo deployments only. */}
              {isDemoMode && <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Select Role Persona (Demo Mode)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {roles.map((r) => {
                    const isSelected = selectedRole === r.role;
                    return (
                      <button
                        type="button"
                        key={r.role}
                        onClick={() => handleRoleSelect(r.role)}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all w-full ${
                          isSelected
                            ? 'bg-indigo-600/30 border-indigo-400 ring-2 ring-indigo-500/50'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span className="block text-xs font-bold text-white">{r.title}</span>
                        <span className="block text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {r.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => void handleDemoSignIn()}
                  disabled={isAuthLoading}
                  className="mt-3 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isAuthLoading ? 'Starting demo…' : `Open demo as ${selectedRole}`}</span>
                </button>
              </div>}

              {loginError && (
                <div role="alert" className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
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
                      autoComplete="current-password"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 text-center font-medium">
                  Credentials are sent only to the configured SAATHI API endpoint.
                </div>

                <button
                  type="submit"
                  disabled={isAuthLoading}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span>{isAuthLoading ? 'Signing in…' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-2 border-t border-slate-800 text-center">
                <p className="text-[10px] text-slate-500">
                  Prototype notice: production privacy, security, and statutory compliance require independent review before deployment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-950 border-t border-slate-800/80 px-6 py-3 text-center text-xs text-slate-500">
        SAATHI Atrocity Victim Wellbeing Platform • Prototype environment • Not an emergency service
      </div>
    </div>
  );
};
