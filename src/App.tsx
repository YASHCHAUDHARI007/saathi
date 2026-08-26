import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CaseMonitoringPage } from './pages/CaseMonitoringPage';
import { IndividualCaseProfilePage } from './pages/IndividualCaseProfilePage';
import { DistressAnalyticsPage } from './pages/DistressAnalyticsPage';
import { RiskAlertsPage } from './pages/RiskAlertsPage';
import { InterventionCenterPage } from './pages/InterventionCenterPage';
import { CheckInsPage } from './pages/CheckInsPage';
import { DistrictAnalyticsPage } from './pages/DistrictAnalyticsPage';
import { StateAnalyticsPage } from './pages/StateAnalyticsPage';
import { NationalDashboardPage } from './pages/NationalDashboardPage';
import { ReportsPage } from './pages/ReportsPage';
import { PrivacySecurityPage } from './pages/PrivacySecurityPage';
import { SettingsPage } from './pages/SettingsPage';
import { VictimDashboardPage } from './pages/VictimDashboardPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
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
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="cases" element={<CaseMonitoringPage />} />
            <Route path="cases/:id" element={<IndividualCaseProfilePage />} />
            <Route path="analytics" element={<DistressAnalyticsPage />} />
            <Route path="alerts" element={<RiskAlertsPage />} />
            <Route path="interventions" element={<InterventionCenterPage />} />
            <Route path="check-ins" element={<CheckInsPage />} />
            <Route path="district" element={<DistrictAnalyticsPage />} />
            <Route path="state" element={<StateAnalyticsPage />} />
            <Route path="national" element={<NationalDashboardPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="security" element={<PrivacySecurityPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="victim" element={<VictimDashboardPage />} />
            <Route path="victim-portal" element={<VictimDashboardPage />} />
            <Route path="victim-dashboard" element={<VictimDashboardPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
