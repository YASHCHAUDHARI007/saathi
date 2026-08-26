import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  CaseItem,
  RiskAlert,
  UserRole,
  RecommendedIntervention,
  InterventionStatus,
  CaseInteraction,
  AuditLogEntry,
  DistrictMetric,
} from '../types';
import {
  mockCases,
  mockAlerts,
  mockAuditLogs,
  mockDistrictMetrics,
  PRIMARY_DEMO_CASE_ID,
} from '../data/mockData';

export interface FilterState {
  searchQuery: string;
  district: string;
  stage: string;
  riskLevel: string;
  caseType: string;
  counsellor: string;
  dateRange: '7D' | '30D' | '90D' | '1Y';
}

interface AppContextType {
  userRole: UserRole;
  userName: string;
  userDistrict: string;
  setUserRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  login: (role?: UserRole) => void;
  logout: () => void;

  cases: CaseItem[];
  getCaseById: (id: string) => CaseItem | undefined;
  alerts: RiskAlert[];
  unreadAlertsCount: number;
  auditLogs: AuditLogEntry[];
  districtMetrics: DistrictMetric[];

  // Reactive mutations
  updateInterventionStatus: (caseId: string, interventionId: string, status: InterventionStatus, notes?: string) => void;
  assignIntervention: (caseId: string, interventionId: string, assignedTo: string, assignedRole: string) => void;
  addRecommendedIntervention: (caseId: string, newIntervention: Omit<RecommendedIntervention, 'id' | 'recommendedAt'>) => void;
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  addInteractionToCheckIn: (caseId: string, interaction: Omit<CaseInteraction, 'id'>) => void;
  assignCounsellorToCase: (caseId: string, counsellorName: string, phone?: string) => void;

  // Filter state
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  filteredCases: CaseItem[];

  // Modals & UI Drawers
  activeReasoningCase: CaseItem | null;
  openReasoningDrawer: (caseItem: CaseItem) => void;
  closeReasoningDrawer: () => void;

  activeInterventionModalCase: { caseItem: CaseItem; intervention?: RecommendedIntervention } | null;
  openInterventionModal: (caseItem: CaseItem, intervention?: RecommendedIntervention) => void;
  closeInterventionModal: () => void;

  showCheckInSimulator: boolean;
  setShowCheckInSimulator: (show: boolean) => void;

  // SIH Judge Demo Helper
  showDemoTour: boolean;
  setShowDemoTour: (show: boolean) => void;
  demoStepIndex: number;
  setDemoStepIndex: (step: number) => void;
}

const defaultFilters: FilterState = {
  searchQuery: '',
  district: 'All',
  stage: 'All',
  riskLevel: 'All',
  caseType: 'All',
  counsellor: 'All',
  dateRange: '30D',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRoleState] = useState<UserRole>('District Officer');
  const [userName, setUserName] = useState<string>('Officer R. S. Patil (Pune Division)');
  const [userDistrict, setUserDistrict] = useState<string>('Pune');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const [cases, setCases] = useState<CaseItem[]>(mockCases);
  const [alerts, setAlerts] = useState<RiskAlert[]>(mockAlerts);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(mockAuditLogs);
  const [districtMetrics] = useState<DistrictMetric[]>(mockDistrictMetrics);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  // Modals
  const [activeReasoningCase, setActiveReasoningCase] = useState<CaseItem | null>(null);
  const [activeInterventionModalCase, setActiveInterventionModalCase] = useState<{
    caseItem: CaseItem;
    intervention?: RecommendedIntervention;
  } | null>(null);
  const [showCheckInSimulator, setShowCheckInSimulator] = useState<boolean>(false);
  const [showDemoTour, setShowDemoTour] = useState<boolean>(false);
  const [demoStepIndex, setDemoStepIndex] = useState<number>(0);

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    if (role === 'District Officer') {
      setUserName('Officer R. S. Patil (Pune Division)');
      setUserDistrict('Pune');
    } else if (role === 'Counsellor') {
      setUserName('Dr. Sunita Deshmukh (Sr. Clinical Counsellor)');
      setUserDistrict('Pune');
    } else if (role === 'State Administrator') {
      setUserName('Admin V. K. Sharma, IAS (Joint Secretary, Dept of Social Justice)');
      setUserDistrict('Maharashtra State');
    } else {
      setUserName('Dr. K. Ramachandran (National Director, MoSJE)');
      setUserDistrict('New Delhi (National)');
    }
  };

  const login = (role?: UserRole) => {
    if (role) setUserRole(role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const getCaseById = (id: string) => {
    return cases.find((c) => c.id === id) || cases.find((c) => c.id === PRIMARY_DEMO_CASE_ID);
  };

  const unreadAlertsCount = useMemo(() => {
    return alerts.filter((a) => a.status === 'Unread').length;
  }, [alerts]);

  const updateInterventionStatus = (
    caseId: string,
    interventionId: string,
    status: InterventionStatus,
    notes?: string
  ) => {
    setCases((prevCases) =>
      prevCases.map((c) => {
        if (c.id !== caseId) return c;
        const updatedInterventions = c.interventions.map((inv) => {
          if (inv.id !== interventionId) return inv;
          return {
            ...inv,
            status,
            actionNotes: notes || inv.actionNotes,
            completedAt: status === 'Completed' ? 'Just now' : inv.completedAt,
          };
        });
        return {
          ...c,
          interventions: updatedInterventions,
        };
      })
    );

    // Record in Audit Log
    const newLog: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: 'Just now',
      userName,
      userRole,
      action: `Updated Intervention status to "${status}"`,
      caseId,
      ipAddress: '10.24.112.44 (Authorized Session)',
      status: 'Success',
      details: notes || `Intervention ${interventionId} status transitioned to ${status}`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const assignIntervention = (
    caseId: string,
    interventionId: string,
    assignedTo: string,
    assignedRole: string
  ) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        return {
          ...c,
          interventions: c.interventions.map((inv) =>
            inv.id === interventionId
              ? { ...inv, assignedTo, assignedRole, status: 'In Progress' }
              : inv
          ),
        };
      })
    );
  };

  const addRecommendedIntervention = (
    caseId: string,
    newIntervention: Omit<RecommendedIntervention, 'id' | 'recommendedAt'>
  ) => {
    const fullInv: RecommendedIntervention = {
      ...newIntervention,
      id: `inv-custom-${Date.now()}`,
      recommendedAt: 'Just now',
    };

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        return {
          ...c,
          interventions: [fullInv, ...c.interventions],
        };
      })
    );
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'Acknowledged' } : a))
    );
  };

  const resolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'Resolved' } : a))
    );
  };

  const assignCounsellorToCase = (caseId: string, counsellorName: string, phone?: string) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              assignedCounsellor: counsellorName,
              counsellorPhone: phone || c.counsellorPhone,
            }
          : c
      )
    );
  };

  const addInteractionToCheckIn = (
    caseId: string,
    interaction: Omit<CaseInteraction, 'id'>
  ) => {
    const fullInteraction: CaseInteraction = {
      ...interaction,
      id: `int-${Date.now()}`,
    };

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const newScore = Math.min(100, Math.max(10, c.distressScore + interaction.distressDelta));
        const newRisk: CaseItem['riskLevel'] =
          newScore >= 80 ? 'HIGH' : newScore >= 60 ? 'HIGH' : newScore >= 45 ? 'MODERATE' : 'LOW';

        return {
          ...c,
          distressScore: newScore,
          riskLevel: newRisk,
          lastInteractionTime: 'Just now',
          interactions: [fullInteraction, ...c.interactions],
          alertTimeline: [
            {
              id: `atl-${Date.now()}`,
              time: 'Just now',
              date: 'Today',
              title: `Live check-in received via ${interaction.channel}`,
              description: `Distress recalculation delta: ${interaction.distressDelta > 0 ? '+' : ''}${interaction.distressDelta} pts (New score: ${newScore}/100)`,
              severity: newScore >= 75 ? 'critical' : 'info',
            },
            ...c.alertTimeline,
          ],
        };
      })
    );
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // Search
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchesQuery =
          c.id.toLowerCase().includes(q) ||
          c.victimAnonymousId.toLowerCase().includes(q) ||
          c.district.toLowerCase().includes(q) ||
          c.caseType.toLowerCase().includes(q) ||
          c.currentStage.toLowerCase().includes(q) ||
          c.assignedCounsellor.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }
      // District
      if (filters.district !== 'All' && c.district !== filters.district) return false;
      // Stage
      if (filters.stage !== 'All' && c.currentStage !== filters.stage) return false;
      // Risk Level
      if (filters.riskLevel !== 'All' && c.riskLevel !== filters.riskLevel) return false;
      // Case Type
      if (filters.caseType !== 'All' && c.caseType !== filters.caseType) return false;
      // Counsellor
      if (
        filters.counsellor !== 'All' &&
        !c.assignedCounsellor.toLowerCase().includes(filters.counsellor.toLowerCase())
      )
        return false;

      return true;
    });
  }, [cases, filters]);

  const openReasoningDrawer = (caseItem: CaseItem) => {
    setActiveReasoningCase(caseItem);
  };

  const closeReasoningDrawer = () => {
    setActiveReasoningCase(null);
  };

  const openInterventionModal = (
    caseItem: CaseItem,
    intervention?: RecommendedIntervention
  ) => {
    setActiveInterventionModalCase({ caseItem, intervention });
  };

  const closeInterventionModal = () => {
    setActiveInterventionModalCase(null);
  };

  return (
    <AppContext.Provider
      value={{
        userRole,
        userName,
        userDistrict,
        setUserRole,
        isAuthenticated,
        login,
        logout,
        cases,
        getCaseById,
        alerts,
        unreadAlertsCount,
        auditLogs,
        districtMetrics,
        updateInterventionStatus,
        assignIntervention,
        addRecommendedIntervention,
        acknowledgeAlert,
        resolveAlert,
        addInteractionToCheckIn,
        assignCounsellorToCase,
        filters,
        setFilters,
        resetFilters,
        filteredCases,
        activeReasoningCase,
        openReasoningDrawer,
        closeReasoningDrawer,
        activeInterventionModalCase,
        openInterventionModal,
        closeInterventionModal,
        showCheckInSimulator,
        setShowCheckInSimulator,
        showDemoTour,
        setShowDemoTour,
        demoStepIndex,
        setDemoStepIndex,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
