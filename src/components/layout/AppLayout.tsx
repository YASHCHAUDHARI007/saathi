import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { AiReasoningDrawer } from '../common/AiReasoningDrawer';
import { InterventionActionModal } from '../common/InterventionActionModal';
import { CheckInSimulatorModal } from '../common/CheckInSimulatorModal';
import { AdvisoryNotice } from '../common/AdvisoryNotice';

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full z-10 shadow-2xl animate-slideRight">
            <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Topbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar bg-slate-50/50">
          <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <Outlet />
            <AdvisoryNotice />
          </div>
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <AiReasoningDrawer />
      <InterventionActionModal />
      <CheckInSimulatorModal />
    </div>
  );
};
