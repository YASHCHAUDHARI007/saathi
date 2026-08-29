import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import type { UserRole } from './types';
const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const CaseMonitoringPage = lazy(() => import('./pages/CaseMonitoringPage').then((module) => ({ default: module.CaseMonitoringPage })));
const IndividualCaseProfilePage = lazy(() => import('./pages/IndividualCaseProfilePage').then((module) => ({ default: module.IndividualCaseProfilePage })));
const DistressAnalyticsPage = lazy(() => import('./pages/DistressAnalyticsPage').then((module) => ({ default: module.DistressAnalyticsPage })));
const RiskAlertsPage = lazy(() => import('./pages/RiskAlertsPage').then((module) => ({ default: module.RiskAlertsPage })));
const InterventionCenterPage = lazy(() => import('./pages/InterventionCenterPage').then((module) => ({ default: module.InterventionCenterPage })));
const CheckInsPage = lazy(() => import('./pages/CheckInsPage').then((module) => ({ default: module.CheckInsPage })));
const DistrictAnalyticsPage = lazy(() => import('./pages/DistrictAnalyticsPage').then((module) => ({ default: module.DistrictAnalyticsPage })));
const StateAnalyticsPage = lazy(() => import('./pages/StateAnalyticsPage').then((module) => ({ default: module.StateAnalyticsPage })));
const NationalDashboardPage = lazy(() => import('./pages/NationalDashboardPage').then((module) => ({ default: module.NationalDashboardPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then((module) => ({ default: module.ReportsPage })));
const PrivacySecurityPage = lazy(() => import('./pages/PrivacySecurityPage').then((module) => ({ default: module.PrivacySecurityPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((module) => ({ default: module.SettingsPage })));
const VictimDashboardPage = lazy(() => import('./pages/VictimDashboardPage').then((module) => ({ default: module.VictimDashboardPage })));

const PageLoading: React.FC = () => (
  <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-6">
    <div role="status" className="text-sm font-semibold">Loading SAATHI…</div>
  </div>
);

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, authStatus } = useApp();
  if (authStatus === 'bootstrapping') return <PageLoading />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AUTHORITY_ROLES: readonly UserRole[] = [
  'District Officer',
  'Counsellor',
  'State Administrator',
  'National Administrator',
];
const STATE_ROLES: readonly UserRole[] = ['State Administrator', 'National Administrator'];
const NATIONAL_ROLES: readonly UserRole[] = ['National Administrator'];
const VICTIM_ROLES: readonly UserRole[] = ['Victim / Citizen'];

const RoleRoute: React.FC<{ allowed: readonly UserRole[]; children: React.ReactNode }> = ({ allowed, children }) => {
  const { userRole } = useApp();
  if (!allowed.includes(userRole)) {
    return <Navigate to={userRole === 'Victim / Citizen' ? '/victim' : '/dashboard'} replace />;
  }
  return <>{children}</>;
};

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoading />}>
        <Routes>
          {/* Public Auth Portal */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Government Dashboard Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<RoleRoute allowed={AUTHORITY_ROLES}><DashboardPage /></RoleRoute>} />
            <Route path="cases" element={<RoleRoute allowed={AUTHORITY_ROLES}><CaseMonitoringPage /></RoleRoute>} />
            <Route path="cases/:id" element={<RoleRoute allowed={AUTHORITY_ROLES}><IndividualCaseProfilePage /></RoleRoute>} />
            <Route path="analytics" element={<RoleRoute allowed={AUTHORITY_ROLES}><DistressAnalyticsPage /></RoleRoute>} />
            <Route path="alerts" element={<RoleRoute allowed={AUTHORITY_ROLES}><RiskAlertsPage /></RoleRoute>} />
            <Route path="interventions" element={<RoleRoute allowed={AUTHORITY_ROLES}><InterventionCenterPage /></RoleRoute>} />
            <Route path="check-ins" element={<RoleRoute allowed={AUTHORITY_ROLES}><CheckInsPage /></RoleRoute>} />
            <Route path="district" element={<RoleRoute allowed={AUTHORITY_ROLES}><DistrictAnalyticsPage /></RoleRoute>} />
            <Route path="state" element={<RoleRoute allowed={STATE_ROLES}><StateAnalyticsPage /></RoleRoute>} />
            <Route path="national" element={<RoleRoute allowed={NATIONAL_ROLES}><NationalDashboardPage /></RoleRoute>} />
            <Route path="reports" element={<RoleRoute allowed={AUTHORITY_ROLES}><ReportsPage /></RoleRoute>} />
            <Route path="security" element={<RoleRoute allowed={AUTHORITY_ROLES}><PrivacySecurityPage /></RoleRoute>} />
            <Route path="settings" element={<RoleRoute allowed={AUTHORITY_ROLES}><SettingsPage /></RoleRoute>} />
            <Route path="victim" element={<RoleRoute allowed={VICTIM_ROLES}><VictimDashboardPage /></RoleRoute>} />
            <Route path="victim-portal" element={<RoleRoute allowed={VICTIM_ROLES}><VictimDashboardPage /></RoleRoute>} />
            <Route path="victim-dashboard" element={<RoleRoute allowed={VICTIM_ROLES}><VictimDashboardPage /></RoleRoute>} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
