import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  AlertTimelineEvent,
  AuditLogEntry,
  CaseInteraction,
  CaseItem,
  CaseMilestone,
  CaseStage,
  CaseType,
  CommunicationChannel,
  ContributingFactor,
  DistrictMetric,
  InterventionStatus,
  InterventionType,
  LongitudinalDataPoint,
  PriorityLevel,
  RecommendedIntervention,
  RiskAlert,
  RiskLevel,
  UserRole,
} from '../types';
import { runtimeConfig } from '../config/runtime';
import {
  api,
  onSessionExpired,
  sessionTokens,
  toErrorMessage,
  type ApiUser,
  type AuthSession,
  type StaffDirectoryEntry,
} from '../services/api';

export interface FilterState {
  searchQuery: string;
  district: string;
  stage: string;
  riskLevel: string;
  caseType: string;
  counsellor: string;
  dateRange: '7D' | '30D' | '90D' | '1Y';
}

export type AuthStatus = 'bootstrapping' | 'authenticated' | 'unauthenticated';

export interface SosSubmissionResult {
  recorded: true;
  dispatchConfirmed: false;
  eventId?: string;
  providerStatus: string;
  message: string;
}

export interface StateAnalyticsMetric {
  stateName: string;
  stateCode: string;
  totalCases: number;
  activeDistricts: number;
  stateAvgDistress: number | null;
  criticalAlerts: number;
  dlsaCoverage: number | null;
  policeResponseTimeHours: number | null;
  convictionRatePct: number | null;
  monetaryReliefDisbursedLakhs: number | null;
}

export interface NationalAnalyticsOverview {
  totalCasesMonitored: number;
  highVulnerabilityCases: number;
  activeUnresolvedAlerts: number;
  interventionsCompleted: number;
  avgNationalDistressIndex: number | null;
  participatingStates: number;
  participatingDistricts: number;
  cctnsSyncStatus: string;
  eCourtsSyncStatus: string;
  dlsaSyncStatus: string;
}

export interface RecordTotals {
  cases: number;
  alerts: number;
  auditLogs: number;
  interventions: number;
  interactions: number;
  staff: number;
}

interface AppContextType {
  userRole: UserRole;
  userName: string;
  userDistrict: string;
  currentUser: ApiUser | null;
  setUserRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  authStatus: AuthStatus;
  isAuthLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  demoLogin: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isDemoMode: boolean;
  usesMockApi: boolean;
  isDataLoading: boolean;
  isRefreshing: boolean;
  isMutating: boolean;
  error: string | null;
  clearError: () => void;
  refreshData: () => Promise<void>;
  cases: CaseItem[];
  getCaseById: (id: string) => CaseItem | undefined;
  loadCaseById: (id: string) => Promise<CaseItem | undefined>;
  alerts: RiskAlert[];
  unreadAlertsCount: number;
  auditLogs: AuditLogEntry[];
  districtMetrics: DistrictMetric[];
  stateMetrics: StateAnalyticsMetric[];
  nationalOverview: NationalAnalyticsOverview | null;
  staffDirectory: StaffDirectoryEntry[];
  recordTotals: RecordTotals;
  updateInterventionStatus: (caseId: string, interventionId: string, status: InterventionStatus, notes?: string) => Promise<boolean>;
  assignIntervention: (caseId: string, interventionId: string, assignedToId: string) => Promise<boolean>;
  addRecommendedIntervention: (caseId: string, newIntervention: Omit<RecommendedIntervention, 'id' | 'recommendedAt'>) => Promise<boolean>;
  acknowledgeAlert: (alertId: string, notes?: string) => Promise<boolean>;
  resolveAlert: (alertId: string, notes?: string) => Promise<boolean>;
  addInteractionToCheckIn: (caseId: string, interaction: Omit<CaseInteraction, 'id'>) => Promise<boolean>;
  assignCounsellorToCase: (caseId: string, counsellorId: string, phone?: string) => Promise<boolean>;
  transitionCaseStage: (caseId: string, stage: CaseStage, notes: string) => Promise<boolean>;
  triggerVictimSOS: (caseId: string, threatDetails: string, idempotencyKey: string, location?: string) => Promise<SosSubmissionResult>;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  filteredCases: CaseItem[];
  activeReasoningCase: CaseItem | null;
  openReasoningDrawer: (caseItem: CaseItem) => void;
  closeReasoningDrawer: () => void;
  activeInterventionModalCase: { caseItem: CaseItem; intervention?: RecommendedIntervention } | null;
  openInterventionModal: (caseItem: CaseItem, intervention?: RecommendedIntervention) => void;
  closeInterventionModal: () => void;
  showCheckInSimulator: boolean;
  setShowCheckInSimulator: (show: boolean) => void;
  showDemoTour: boolean;
  setShowDemoTour: (show: boolean) => void;
  demoStepIndex: number;
  setDemoStepIndex: (step: number) => void;
}

type UnknownRecord = Record<string, unknown>;

const defaultFilters: FilterState = {
  searchQuery: '',
  district: 'All',
  stage: 'All',
  riskLevel: 'All',
  caseType: 'All',
  counsellor: 'All',
  dateRange: '30D',
};
const emptyRecordTotals: RecordTotals = {
  cases: 0,
  alerts: 0,
  auditLogs: 0,
  interventions: 0,
  interactions: 0,
  staff: 0,
};

const CASE_STAGES: readonly CaseStage[] = ['Complaint', 'Investigation', 'Trial', 'Judgment', 'Compensation', 'Rehabilitation', 'Closure'];
const CASE_TYPES: readonly CaseType[] = ['Caste-based Violence', 'Atrocities against SC/ST', 'Witness Intimidation', 'Sexual Assault / Rape', 'Physical Assault', 'Social Boycott', 'Land Dispossession', 'Hate Crime / Verbal Abuse'];
const RISK_LEVELS: readonly RiskLevel[] = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];
const PRIORITIES: readonly PriorityLevel[] = ['P1', 'P2', 'P3'];
const INTERVENTION_TYPES: readonly InterventionType[] = ['Counselling', 'Medical Treatment', 'Witness Protection', 'Relocation Support', 'Financial Assistance', 'Legal Aid', 'Rehabilitation'];
const INTERVENTION_STATUSES: readonly InterventionStatus[] = ['Pending', 'In Progress', 'Completed', 'Escalated'];
const COMMUNICATION_CHANNELS: readonly CommunicationChannel[] = ['Chatbot', 'IVRS (Voice)', 'SMS', 'Mobile App', 'Web Portal', 'Toll-Free Helpline (14566)'];

const isRecord = (value: unknown): value is UnknownRecord => typeof value === 'object' && value !== null && !Array.isArray(value);
const record = (value: unknown): UnknownRecord => (isRecord(value) ? value : {});
const stringValue = (value: unknown, fallback = ''): string => typeof value === 'string' && value.trim() ? value : fallback;
const numberValue = (value: unknown, fallback = 0): number => {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const nullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};
const booleanValue = (value: unknown, fallback = false): boolean => typeof value === 'boolean' ? value : fallback;
const stringArray = (value: unknown): string[] => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
const enumValue = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  typeof value === 'string' && allowed.includes(value as T) ? (value as T) : fallback;

const roleFromApi = (role: unknown, displayRole?: unknown): UserRole => {
  const display = stringValue(displayRole);
  if (display === 'District Officer' || display === 'Counsellor' || display === 'State Administrator' || display === 'National Administrator' || display === 'Victim / Citizen') return display;
  switch (role) {
    case 'DISTRICT_OFFICER': return 'District Officer';
    case 'COUNSELLOR': return 'Counsellor';
    case 'STATE_ADMIN': return 'State Administrator';
    case 'NATIONAL_ADMIN': return 'National Administrator';
    case 'VICTIM_CITIZEN': return 'Victim / Citizen';
    default: throw new Error('This account does not have a supported SAATHI role. Access was denied.');
  }
};

const mapFactor = (value: unknown): ContributingFactor => {
  const dto = record(value);
  return {
    id: stringValue(dto.id, crypto.randomUUID()),
    factor: stringValue(dto.factor, 'Unspecified factor'),
    points: numberValue(dto.points),
    category: enumValue(dto.category, ['Trend', 'Sentiment', 'Threat', 'Engagement', 'Behavioral'] as const, 'Behavioral'),
    description: stringValue(dto.description),
  };
};

const mapTrajectoryPoint = (value: unknown): LongitudinalDataPoint => {
  const dto = record(value);
  return {
    date: stringValue(dto.date),
    weekLabel: stringValue(dto.weekLabel) || undefined,
    distressScore: numberValue(dto.distressScore),
    engagementScore: numberValue(dto.engagementScore),
    sentimentScore: numberValue(dto.sentimentScore),
    threatSignalScore: numberValue(dto.threatSignalScore),
    checkInFrequency: numberValue(dto.checkInFrequency),
    interventionImpact: dto.interventionImpact === undefined ? undefined : numberValue(dto.interventionImpact),
    detectedSignal: stringValue(dto.detectedSignal) || undefined,
    caseStage: enumValue(dto.caseStage, CASE_STAGES, 'Investigation'),
    notes: stringValue(dto.notes) || undefined,
  };
};

const mapMilestone = (value: unknown): CaseMilestone => {
  const dto = record(value);
  return {
    stage: enumValue(dto.stage, CASE_STAGES, 'Investigation'),
    title: stringValue(dto.title, 'Case milestone'),
    date: stringValue(dto.date),
    completed: booleanValue(dto.completed),
    isCurrent: booleanValue(dto.isCurrent ?? dto.is_current),
    distressTrend: stringValue(dto.distressTrend ?? dto.distress_trend),
    interventions: stringArray(dto.interventions),
    importantEvents: stringArray(dto.importantEvents ?? dto.important_events),
  };
};

const mapTimelineEvent = (value: unknown): AlertTimelineEvent => {
  const dto = record(value);
  return {
    id: stringValue(dto.id, crypto.randomUUID()),
    time: stringValue(dto.time),
    date: stringValue(dto.date),
    title: stringValue(dto.title, 'Case event'),
    description: stringValue(dto.description),
    severity: enumValue(dto.severity, ['info', 'warning', 'critical', 'success'] as const, 'info'),
  };
};

const mapInteraction = (value: unknown): CaseInteraction => {
  const dto = record(value);
  const voiceStress = stringValue(dto.voiceStressLevel);
  const rawChannel = stringValue(dto.channel);
  const normalizedChannel = rawChannel === 'IVRS'
    ? 'IVRS (Voice)'
    : rawChannel === 'Toll-Free Helpline'
      ? 'Toll-Free Helpline (14566)'
      : rawChannel;
  const rawSentiment = stringValue(dto.sentiment);
  const normalizedSentiment = rawSentiment === 'High Distress'
    ? 'Severe Distress'
    : rawSentiment === 'Mild Negative'
      ? 'Negative'
      : rawSentiment === 'Positive / Relieved'
        ? 'Positive'
        : rawSentiment;
  return {
    id: stringValue(dto.id, crypto.randomUUID()),
    timestamp: stringValue(dto.timestamp, [stringValue(dto.date), stringValue(dto.time)].filter(Boolean).join(', ') || stringValue(dto.created_at)),
    channel: enumValue(normalizedChannel, COMMUNICATION_CHANNELS, 'Chatbot'),
    prompt: stringValue(dto.prompt ?? dto.promptMessage),
    victimResponse: stringValue(dto.victimResponse ?? dto.response_text),
    sentiment: enumValue(normalizedSentiment, ['Positive', 'Neutral', 'Concern', 'Negative', 'Severe Distress'] as const, 'Neutral'),
    threatDetected: booleanValue(dto.threatDetected),
    threatKeywords: stringArray(dto.threatKeywords),
    voiceStressLevel: voiceStress ? enumValue(voiceStress === 'Normal' ? 'Low' : voiceStress, ['Low', 'Moderate', 'Elevated', 'Severe'] as const, 'Low') : undefined,
    distressDelta: numberValue(dto.distressDelta),
    aiSignals: stringArray(dto.aiSignals),
    audioDurationSeconds: dto.audioDurationSeconds === undefined && dto.audio_duration_seconds === undefined ? undefined : numberValue(dto.audioDurationSeconds ?? dto.audio_duration_seconds),
  };
};

const mapIntervention = (value: unknown): RecommendedIntervention => {
  const dto = record(value);
  return {
    id: stringValue(dto.id, crypto.randomUUID()),
    caseId: stringValue(dto.caseId ?? dto.case_id),
    assignedToId: stringValue(dto.assignedToId ?? dto.assigned_to_id) || undefined,
    type: enumValue(dto.type, INTERVENTION_TYPES, 'Counselling'),
    title: stringValue(dto.title, 'Support intervention'),
    reason: stringValue(dto.reason ?? dto.description),
    priority: enumValue(dto.priority, PRIORITIES, 'P2'),
    assignedTo: stringValue(dto.assignedTo ?? dto.assigned_to_name, 'Unassigned'),
    assignedRole: stringValue(dto.assignedRole ?? dto.department, 'Unassigned department'),
    status: enumValue(dto.status, INTERVENTION_STATUSES, 'Pending'),
    recommendedAt: stringValue(dto.recommendedAt ?? dto.created_at),
    deadline: stringValue(dto.deadline ?? dto.targetDate ?? dto.target_date) || undefined,
    completedAt: stringValue(dto.completedAt ?? dto.completedDate ?? dto.completed_date) || undefined,
    actionNotes: stringValue(dto.actionNotes ?? dto.notes) || undefined,
  };
};

const mapCase = (value: unknown, existing?: CaseItem): CaseItem => {
  const dto = record(value);
  const mapOptionalArray = <T,>(source: unknown, mapper: (item: unknown) => T, fallback: T[]): T[] => Array.isArray(source) ? source.map(mapper) : fallback;
  return {
    id: stringValue(dto.id, existing?.id ?? ''),
    victimAnonymousId: stringValue(dto.victimAnonymousId, existing?.victimAnonymousId ?? 'Anonymous subject'),
    subjectRole: enumValue(dto.subjectRole, ['Victim', 'Witness', 'Family Member'] as const, existing?.subjectRole ?? 'Victim'),
    caseType: enumValue(dto.caseType, CASE_TYPES, existing?.caseType ?? 'Atrocities against SC/ST'),
    district: stringValue(dto.district, existing?.district ?? 'Unassigned'),
    state: stringValue(dto.state, existing?.state ?? 'Unassigned'),
    currentStage: enumValue(dto.currentStage, CASE_STAGES, existing?.currentStage ?? 'Investigation'),
    distressScore: numberValue(dto.distressScore, existing?.distressScore ?? 0),
    previousDistressScore: numberValue(dto.previousDistressScore, existing?.previousDistressScore ?? 0),
    baselineScore: numberValue(dto.baselineScore, existing?.baselineScore ?? 0),
    riskLevel: enumValue(dto.riskLevel, RISK_LEVELS, existing?.riskLevel ?? 'LOW'),
    trend: stringValue(dto.trend, existing?.trend ?? '→ 0'),
    trendDirection: enumValue(dto.trendDirection, ['increasing', 'stable', 'decreasing'] as const, existing?.trendDirection ?? 'stable'),
    lastInteractionTime: stringValue(dto.lastInteractionTime, existing?.lastInteractionTime ?? 'No check-ins recorded'),
    assignedCounsellor: stringValue(dto.assignedCounsellor, existing?.assignedCounsellor ?? 'Unassigned'),
    counsellorPhone: stringValue(dto.counsellorPhone, existing?.counsellorPhone ?? '') || undefined,
    firNumber: stringValue(dto.firNumber ?? dto.fir_number, existing?.firNumber ?? '') || undefined,
    priority: enumValue(dto.priority, PRIORITIES, existing?.priority ?? 'P3'),
    monitoringStatus: enumValue(dto.monitoringStatus, ['Active', 'Elevated', 'Under Review', 'Dormant'] as const, existing?.monitoringStatus ?? 'Active'),
    textSentiment: enumValue(dto.textSentiment, ['Positive', 'Neutral', 'Negative', 'High Distress'] as const, existing?.textSentiment ?? 'Neutral'),
    distressLanguageStatus: enumValue(dto.distressLanguageStatus, ['Normal', 'Elevated', 'Critical'] as const, existing?.distressLanguageStatus ?? 'Normal'),
    voiceStressStatus: enumValue(dto.voiceStressStatus, ['Normal', 'Moderate', 'Elevated', 'Severe'] as const, existing?.voiceStressStatus ?? 'Normal'),
    emotionSignal: enumValue(dto.emotionSignal, ['Calm', 'Apprehensive', 'Concern', 'Fear', 'Despair'] as const, existing?.emotionSignal ?? 'Calm'),
    engagementRateChange: stringValue(dto.engagementRateChange, existing?.engagementRateChange ?? '0%'),
    missedFollowUps: numberValue(dto.missedFollowUps, existing?.missedFollowUps ?? 0),
    responseFrequency: enumValue(dto.responseFrequency, ['Active', 'Declining', 'Sporadic', 'Unresponsive'] as const, existing?.responseFrequency ?? 'Active'),
    contributingFactors: mapOptionalArray(dto.contributingFactors, mapFactor, existing?.contributingFactors ?? []),
    primaryContributingFactor: stringValue(dto.primaryContributingFactor, existing?.primaryContributingFactor ?? ''),
    aiExplanationSummary: stringValue(dto.aiExplanationSummary, existing?.aiExplanationSummary ?? ''),
    longitudinalTrajectory: mapOptionalArray(dto.longitudinalTrajectory, mapTrajectoryPoint, existing?.longitudinalTrajectory ?? []),
    milestones: mapOptionalArray(dto.milestones, mapMilestone, existing?.milestones ?? []),
    interactions: mapOptionalArray(dto.interactions, mapInteraction, existing?.interactions ?? []),
    interventions: mapOptionalArray(dto.interventions, mapIntervention, existing?.interventions ?? []),
    alertTimeline: mapOptionalArray(dto.alertTimeline, mapTimelineEvent, existing?.alertTimeline ?? []),
  };
};

const mapAlert = (value: unknown): RiskAlert => {
  const dto = record(value);
  const primaryFactor = stringValue(dto.primaryFactor, 'Risk signal recorded');
  return {
    id: stringValue(dto.id, crypto.randomUUID()),
    caseId: stringValue(dto.caseId),
    victimAnonymousId: stringValue(dto.victimAnonymousId, 'Anonymous subject'),
    district: stringValue(dto.district, 'Unassigned'),
    riskLevel: enumValue(dto.riskLevel, RISK_LEVELS, 'LOW'),
    reason: stringValue(dto.reason, primaryFactor),
    detectedAt: stringValue(dto.detectedAt ?? dto.timeAgo ?? dto.timestamp),
    status: enumValue(dto.status, ['Unread', 'Acknowledged', 'Resolved'] as const, 'Unread'),
    primaryFactor,
    recommendations: stringArray(dto.recommendations ?? dto.recommendedActions),
    distressScore: numberValue(dto.distressScore),
    previousScore: numberValue(dto.previousScore ?? dto.previousDistressScore),
    assignedCounsellor: stringValue(dto.assignedCounsellor ?? dto.assignedTo, 'Unassigned'),
  };
};

const mapAuditLog = (value: unknown): AuditLogEntry => {
  const dto = record(value);
  return {
    id: stringValue(dto.id, crypto.randomUUID()),
    timestamp: stringValue(dto.timestamp, [stringValue(dto.date), stringValue(dto.time)].filter(Boolean).join(', ') || stringValue(dto.created_at)),
    userName: stringValue(dto.userName ?? dto.user_name, 'System'),
    userRole: stringValue(dto.userRole ?? dto.user_role, 'SYSTEM'),
    action: stringValue(dto.action, 'Recorded activity'),
    caseId: stringValue(dto.caseId ?? dto.resource_id),
    ipAddress: stringValue(dto.ipAddress ?? dto.ip_address, 'Not provided'),
    status: 'Success',
    details: stringValue(dto.details),
  };
};

const mapDistrictMetric = (value: unknown): DistrictMetric => {
  const dto = record(value);
  const coordinates = record(dto.geoCoordinates ?? dto.coordinates);
  const avgDistressScore = nullableNumber(dto.avgDistressScore);
  return {
    name: stringValue(dto.name ?? dto.districtName, 'Unknown district'),
    state: stringValue(dto.state ?? dto.stateName, 'Unknown state'),
    activeCases: numberValue(dto.activeCases),
    monitoringCases: numberValue(dto.monitoringCases, numberValue(dto.activeCases)),
    highRiskCases: numberValue(dto.highRiskCases ?? dto.highDistressCount),
    criticalCases: numberValue(dto.criticalCases ?? dto.criticalAlerts),
    avgDistressScore,
    interventionsCompleted: numberValue(dto.interventionsCompleted),
    followUpsDue: numberValue(dto.followUpsDue),
    riskLevel: avgDistressScore === null
      ? null
      : avgDistressScore >= 80
        ? 'CRITICAL'
        : avgDistressScore >= 60
          ? 'HIGH'
          : avgDistressScore >= 40
            ? 'MODERATE'
            : 'LOW',
    riskEscalationRate: stringValue(dto.riskEscalationRate, 'Not provided'),
    counsellorRatio: stringValue(dto.counsellorRatio, 'Not provided'),
    coordinates: { x: numberValue(coordinates.x), y: numberValue(coordinates.y) },
  };
};

const mapStateMetric = (value: unknown): StateAnalyticsMetric => {
  const dto = record(value);
  return {
    stateName: stringValue(dto.stateName, 'Unknown state'),
    stateCode: stringValue(dto.stateCode),
    totalCases: numberValue(dto.totalCases),
    activeDistricts: numberValue(dto.activeDistricts),
    stateAvgDistress: nullableNumber(dto.stateAvgDistress),
    criticalAlerts: numberValue(dto.criticalAlerts),
    dlsaCoverage: nullableNumber(dto.dlsaCoverage),
    policeResponseTimeHours: nullableNumber(dto.policeResponseTimeHours),
    convictionRatePct: nullableNumber(dto.convictionRatePct),
    monetaryReliefDisbursedLakhs: nullableNumber(dto.monetaryReliefDisbursedLakhs),
  };
};

const mapNationalOverview = (value: unknown): NationalAnalyticsOverview => {
  const dto = record(value);
  return {
    totalCasesMonitored: numberValue(dto.totalCasesMonitored),
    highVulnerabilityCases: numberValue(dto.highVulnerabilityCases),
    activeUnresolvedAlerts: numberValue(dto.activeUnresolvedAlerts),
    interventionsCompleted: numberValue(dto.interventionsCompleted),
    avgNationalDistressIndex: nullableNumber(dto.avgNationalDistressIndex),
    participatingStates: numberValue(dto.participatingStates),
    participatingDistricts: numberValue(dto.participatingDistricts),
    cctnsSyncStatus: stringValue(dto.cctnsSyncStatus, 'Not provided'),
    eCourtsSyncStatus: stringValue(dto.eCourtsSyncStatus, 'Not provided'),
    dlsaSyncStatus: stringValue(dto.dlsaSyncStatus, 'Not provided'),
  };
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);
  const currentUserRef = useRef<ApiUser | null>(null);
  const sessionEpochRef = useRef(0);
  const loadGenerationRef = useRef(0);
  const dataRevisionRef = useRef(0);
  const [userRole, setUserRoleState] = useState<UserRole>('District Officer');
  const [userName, setUserName] = useState('Signed out');
  const [userDistrict, setUserDistrict] = useState('');
  const [authStatus, setAuthStatus] = useState<AuthStatus>('bootstrapping');
  const [cases, setCases] = useState<CaseItem[]>([]);
  const casesRef = useRef<CaseItem[]>([]);
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [districtMetrics, setDistrictMetrics] = useState<DistrictMetric[]>([]);
  const [stateMetrics, setStateMetrics] = useState<StateAnalyticsMetric[]>([]);
  const [nationalOverview, setNationalOverview] = useState<NationalAnalyticsOverview | null>(null);
  const [staffDirectory, setStaffDirectory] = useState<StaffDirectoryEntry[]>([]);
  const [recordTotals, setRecordTotals] = useState<RecordTotals>(emptyRecordTotals);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mutationCount, setMutationCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [activeReasoningCase, setActiveReasoningCase] = useState<CaseItem | null>(null);
  const [activeInterventionModalCase, setActiveInterventionModalCase] = useState<{ caseItem: CaseItem; intervention?: RecommendedIntervention } | null>(null);
  const [showCheckInSimulator, setShowCheckInSimulatorState] = useState(false);
  const [showDemoTour, setShowDemoTourState] = useState(false);
  const [demoStepIndex, setDemoStepIndexState] = useState(0);

  useEffect(() => {
    casesRef.current = cases;
  }, [cases]);

  const applyUser = useCallback((user: ApiUser) => {
    const role = roleFromApi(user.role, user.role_display);
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
    setCurrentUser(user);
    currentUserRef.current = user;
    setUserRoleState(role);
    setUserName(fullName || user.username || user.email || role);
    setUserDistrict(user.district_name || user.state_name || 'Unassigned jurisdiction');
  }, []);

  const applyDemoRole = useCallback((role: UserRole) => {
    const personas: Record<UserRole, { name: string; district: string; code: string }> = {
      'District Officer': { name: 'Demo District Officer', district: 'Pune', code: 'DISTRICT_OFFICER' },
      Counsellor: { name: 'Demo Counsellor', district: 'Pune', code: 'COUNSELLOR' },
      'State Administrator': { name: 'Demo State Administrator', district: 'Maharashtra', code: 'STATE_ADMIN' },
      'National Administrator': { name: 'Demo National Administrator', district: 'National', code: 'NATIONAL_ADMIN' },
      'Victim / Citizen': { name: 'Demo Citizen', district: 'Pune Rural', code: 'VICTIM_CITIZEN' },
    };
    const persona = personas[role];
    applyUser({ id: `demo-${persona.code.toLowerCase()}`, username: `demo_${persona.code.toLowerCase()}`, email: '', first_name: persona.name, last_name: '', role: persona.code, role_display: role, district_name: persona.district, is_active: true });
  }, [applyUser]);

  const clearSessionState = useCallback((message?: string) => {
    sessionEpochRef.current += 1;
    loadGenerationRef.current += 1;
    dataRevisionRef.current += 1;
    sessionTokens.clear();
    setCurrentUser(null);
    currentUserRef.current = null;
    setUserName('Signed out');
    setUserDistrict('');
    setAuthStatus('unauthenticated');
    setCases([]);
    setAlerts([]);
    setAuditLogs([]);
    setDistrictMetrics([]);
    setStateMetrics([]);
    setNationalOverview(null);
    setStaffDirectory([]);
    setRecordTotals(emptyRecordTotals);
    setMutationCount(0);
    setActiveReasoningCase(null);
    setActiveInterventionModalCase(null);
    setShowCheckInSimulatorState(false);
    if (message) setError(message);
  }, []);

  const loadData = useCallback(async (refreshing = false): Promise<void> => {
    const sessionEpoch = sessionEpochRef.current;
    const loadGeneration = loadGenerationRef.current + 1;
    loadGenerationRef.current = loadGeneration;
    const dataRevision = dataRevisionRef.current;
    if (refreshing) setIsRefreshing(true); else setIsDataLoading(true);
    setError(null);
    try {
      if (runtimeConfig.useMockApi) {
        const mock = await import('../data/mockData');
        if (
          sessionEpoch !== sessionEpochRef.current
          || loadGeneration !== loadGenerationRef.current
          || dataRevision !== dataRevisionRef.current
        ) return;
        setCases(mock.mockCases);
        setAlerts(mock.mockAlerts);
        setAuditLogs(mock.mockAuditLogs);
        setDistrictMetrics(mock.mockDistrictMetrics);
        setStateMetrics([]);
        setNationalOverview(null);
        const demoCounsellors = [...new Set(mock.mockCases.map((item) => item.assignedCounsellor).filter((name) => name && name !== 'Unassigned'))];
        const demoStaff = demoCounsellors.map((displayName, index) => ({
          id: `demo-counsellor-${index + 1}`,
          display_name: displayName,
          role: 'COUNSELLOR',
          district: null,
          district_name: null,
          designation: 'Demo counsellor',
        }));
        setStaffDirectory(demoStaff);
        setRecordTotals({
          cases: mock.mockCases.length,
          alerts: mock.mockAlerts.length,
          auditLogs: mock.mockAuditLogs.length,
          interventions: mock.mockCases.reduce((total, item) => total + item.interventions.length, 0),
          interactions: mock.mockCases.reduce((total, item) => total + item.interactions.length, 0),
          staff: demoStaff.length,
        });
        return;
      }
      const apiRole = currentUserRef.current?.role;
      const isAuthority = apiRole === 'DISTRICT_OFFICER' || apiRole === 'STATE_ADMIN' || apiRole === 'NATIONAL_ADMIN';
      const isOperationalStaff = isAuthority || apiRole === 'COUNSELLOR';
      const canLoadStateAnalytics = apiRole === 'STATE_ADMIN' || apiRole === 'NATIONAL_ADMIN';
      const canLoadNationalAnalytics = apiRole === 'NATIONAL_ADMIN';
      const emptyCollection = { items: [], count: 0, next: null, previous: null };
      const [caseResult, alertResult, auditResult, districtResult, stateResult, nationalResult, interventionResult, interactionResult, staffResult] = await Promise.allSettled([
        api.getCollection<UnknownRecord>('cases/'),
        isOperationalStaff ? api.getCollection<UnknownRecord>('alerts/') : Promise.resolve(emptyCollection),
        isAuthority ? api.getCollection<UnknownRecord>('audit/logs/') : Promise.resolve(emptyCollection),
        isOperationalStaff ? api.getCollection<UnknownRecord>('analytics/district/') : Promise.resolve(emptyCollection),
        canLoadStateAnalytics ? api.getCollection<UnknownRecord>('analytics/state/') : Promise.resolve(emptyCollection),
        canLoadNationalAnalytics ? api.get<UnknownRecord>('analytics/national/') : Promise.resolve(null),
        isOperationalStaff ? api.getCollection<UnknownRecord>('interventions/') : Promise.resolve(emptyCollection),
        isOperationalStaff ? api.getCollection<UnknownRecord>('interactions/') : Promise.resolve(emptyCollection),
        isAuthority
          ? api.getCollection<StaffDirectoryEntry>('auth/users/')
          : Promise.resolve(emptyCollection),
      ] as const);

      if (
        sessionEpoch !== sessionEpochRef.current
        || loadGeneration !== loadGenerationRef.current
        || dataRevision !== dataRevisionRef.current
      ) return;
      setRecordTotals((previous) => ({
        cases: caseResult.status === 'fulfilled' ? caseResult.value.count : previous.cases,
        alerts: alertResult.status === 'fulfilled' ? alertResult.value.count : previous.alerts,
        auditLogs: auditResult.status === 'fulfilled' ? auditResult.value.count : previous.auditLogs,
        interventions: interventionResult.status === 'fulfilled' ? interventionResult.value.count : previous.interventions,
        interactions: interactionResult.status === 'fulfilled' ? interactionResult.value.count : previous.interactions,
        staff: staffResult.status === 'fulfilled' ? staffResult.value.count : previous.staff,
      }));
      setCases((previousCases) => {
        const previousById = new Map<string, CaseItem>(previousCases.map((item) => [item.id, item]));
        const baseCases = caseResult.status === 'fulfilled'
          ? caseResult.value.items.map((item) => mapCase(item, previousById.get(stringValue(item.id)))).filter((item) => item.id)
          : previousCases;
        const interventionsByCase = new Map<string, RecommendedIntervention[]>();
        if (interventionResult.status === 'fulfilled') {
          interventionResult.value.items.map(mapIntervention).forEach((intervention) => {
            const list = interventionsByCase.get(intervention.caseId) ?? [];
            list.push(intervention);
            interventionsByCase.set(intervention.caseId, list);
          });
        }
        const interactionsByCase = new Map<string, CaseInteraction[]>();
        if (interactionResult.status === 'fulfilled') {
          interactionResult.value.items.forEach((rawInteraction) => {
            const caseId = stringValue(rawInteraction.case_id ?? rawInteraction.caseId);
            if (!caseId) return;
            const list = interactionsByCase.get(caseId) ?? [];
            list.push(mapInteraction(rawInteraction));
            interactionsByCase.set(caseId, list);
          });
        }
        return baseCases.map((item) => ({
          ...item,
          interventions: interventionResult.status === 'fulfilled' && interventionsByCase.has(item.id)
            ? interventionsByCase.get(item.id) ?? []
            : item.interventions,
          interactions: interactionResult.status === 'fulfilled' && interactionsByCase.has(item.id)
            ? interactionsByCase.get(item.id) ?? []
            : item.interactions,
        }));
      });
      if (alertResult.status === 'fulfilled') setAlerts(alertResult.value.items.map(mapAlert));
      if (auditResult.status === 'fulfilled') setAuditLogs(auditResult.value.items.map(mapAuditLog));
      if (districtResult.status === 'fulfilled') setDistrictMetrics(districtResult.value.items.map(mapDistrictMetric));
      if (stateResult.status === 'fulfilled') setStateMetrics(stateResult.value.items.map(mapStateMetric));
      if (nationalResult.status === 'fulfilled') setNationalOverview(nationalResult.value ? mapNationalOverview(nationalResult.value) : null);
      if (staffResult.status === 'fulfilled') setStaffDirectory(staffResult.value.items);
      const failures = [caseResult, alertResult, auditResult, districtResult, stateResult, nationalResult, interventionResult, interactionResult, staffResult]
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map((result) => toErrorMessage(result.reason));
      if (failures.length > 0) setError(`Some dashboard data could not be loaded: ${[...new Set(failures)].join(' ')}`);
    } catch (loadError) {
      if (
        sessionEpoch === sessionEpochRef.current
        && loadGeneration === loadGenerationRef.current
        && dataRevision === dataRevisionRef.current
      ) setError(toErrorMessage(loadError));
    } finally {
      if (
        sessionEpoch === sessionEpochRef.current
        && loadGeneration === loadGenerationRef.current
      ) {
        setIsDataLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => onSessionExpired(() => clearSessionState('Your session expired. Please sign in again.')), [clearSessionState]);

  useEffect(() => {
    let active = true;
    const bootstrap = async (): Promise<void> => {
      const sessionEpoch = sessionEpochRef.current;
      if (!sessionTokens.hasSession()) {
        if (active) setAuthStatus('unauthenticated');
        return;
      }
      try {
        const user = await api.get<ApiUser>('auth/me/');
        if (!active || sessionEpoch !== sessionEpochRef.current) return;
        applyUser(user);
        setAuthStatus('authenticated');
        await loadData();
      } catch (bootstrapError) {
        if (active && sessionEpoch === sessionEpochRef.current) {
          clearSessionState(toErrorMessage(bootstrapError));
        }
      }
    };
    void bootstrap();
    return () => { active = false; };
  }, [applyUser, clearSessionState, loadData]);

  const login = useCallback(async (username: string, password: string): Promise<void> => {
    const sessionEpoch = sessionEpochRef.current + 1;
    sessionEpochRef.current = sessionEpoch;
    setAuthStatus('bootstrapping');
    setError(null);
    try {
      const session = await api.post<AuthSession>('auth/login/', { username: username.trim(), password }, { auth: false, retryOnUnauthorized: false });
      if (sessionEpoch !== sessionEpochRef.current) throw new Error('A newer sign-in request replaced this one.');
      if (!session.access || !session.refresh || !session.user) throw new Error('The server returned an incomplete login response.');
      sessionTokens.set({ access: session.access, refresh: session.refresh });
      applyUser(session.user);
      setAuthStatus('authenticated');
      await loadData();
    } catch (loginError) {
      const message = toErrorMessage(loginError);
      if (sessionEpoch === sessionEpochRef.current) {
        clearSessionState();
        setError(message);
      }
      throw new Error(message);
    }
  }, [applyUser, clearSessionState, loadData]);

  const demoLogin = useCallback(async (role: UserRole): Promise<void> => {
    if (!runtimeConfig.demoMode) throw new Error('Demo personas are disabled for this deployment.');
    const sessionEpoch = sessionEpochRef.current + 1;
    sessionEpochRef.current = sessionEpoch;
    setAuthStatus('bootstrapping');
    setError(null);
    try {
      if (runtimeConfig.useMockApi) {
        sessionTokens.clear();
        applyDemoRole(role);
      } else {
        const roleCodes: Record<UserRole, string> = { 'District Officer': 'DISTRICT_OFFICER', Counsellor: 'COUNSELLOR', 'State Administrator': 'STATE_ADMIN', 'National Administrator': 'NATIONAL_ADMIN', 'Victim / Citizen': 'VICTIM_CITIZEN' };
        const session = await api.post<AuthSession>('auth/demo-login/', { role: roleCodes[role] }, { auth: false, retryOnUnauthorized: false });
        if (sessionEpoch !== sessionEpochRef.current) throw new Error('A newer sign-in request replaced this one.');
        if (!session.access || !session.refresh || !session.user) throw new Error('The server returned an incomplete demo login response.');
        sessionTokens.set({ access: session.access, refresh: session.refresh });
        applyUser(session.user);
      }
      setAuthStatus('authenticated');
      await loadData();
    } catch (demoError) {
      const message = toErrorMessage(demoError);
      if (sessionEpoch === sessionEpochRef.current) {
        clearSessionState();
        setError(message);
      }
      throw new Error(message);
    }
  }, [applyDemoRole, applyUser, clearSessionState, loadData]);

  const logout = useCallback(async (): Promise<void> => {
    sessionEpochRef.current += 1;
    setAuthStatus('bootstrapping');
    try {
      if (!runtimeConfig.useMockApi && sessionTokens.getRefresh()) {
        // Refresh an expired access token first so the currently active,
        // potentially rotated refresh token is the one revoked.
        await api.get<ApiUser>('auth/me/');
        const activeRefresh = sessionTokens.getRefresh();
        if (activeRefresh) {
          await api.post<unknown>('auth/logout/', { refresh: activeRefresh }, { retryOnUnauthorized: false });
        }
      }
    } catch {
      // Local sign-out still proceeds. The UI does not claim that server-side
      // token revocation succeeded when the endpoint is unavailable.
    } finally {
      clearSessionState();
      setError(null);
    }
  }, [clearSessionState]);
  const setUserRole = useCallback((role: UserRole) => {
    if (!runtimeConfig.demoMode || !currentUser) return;
    if (runtimeConfig.useMockApi) applyDemoRole(role);
    else void demoLogin(role);
  }, [applyDemoRole, currentUser, demoLogin]);
  const getCaseById = useCallback((id: string): CaseItem | undefined => cases.find((item) => item.id === id), [cases]);

  const loadCaseById = useCallback(async (id: string): Promise<CaseItem | undefined> => {
    const sessionEpoch = sessionEpochRef.current;
    const dataRevision = dataRevisionRef.current;
    const exactId = id.trim();
    if (!exactId) return undefined;
    if (runtimeConfig.useMockApi) return casesRef.current.find((item) => item.id === exactId);
    try {
      const detail = await api.get<UnknownRecord>(`cases/${encodeURIComponent(exactId)}/`);
      if (
        sessionEpoch !== sessionEpochRef.current
        || dataRevision !== dataRevisionRef.current
      ) return casesRef.current.find((item) => item.id === exactId);
      const existing = casesRef.current.find((item) => item.id === exactId);
      const mapped = mapCase(detail, existing);
      setCases((previous) => previous.some((item) => item.id === exactId)
        ? previous.map((item) => item.id === exactId ? mapped : item)
        : [...previous, mapped]);
      return mapped;
    } catch (caseError) {
      if (
        sessionEpoch === sessionEpochRef.current
        && dataRevision === dataRevisionRef.current
      ) setError(toErrorMessage(caseError));
      return undefined;
    }
  }, []);

  const runMutation = useCallback(async (operation: (sessionEpoch: number) => Promise<void>): Promise<boolean> => {
    const sessionEpoch = sessionEpochRef.current;
    setMutationCount((count) => count + 1);
    setError(null);
    try {
      await operation(sessionEpoch);
      return sessionEpoch === sessionEpochRef.current;
    } catch (mutationError) {
      if (sessionEpoch === sessionEpochRef.current) setError(toErrorMessage(mutationError));
      return false;
    } finally {
      if (sessionEpoch === sessionEpochRef.current) {
        setMutationCount((count) => Math.max(0, count - 1));
      }
    }
  }, []);

  const updateInterventionStatus = useCallback((caseId: string, interventionId: string, status: InterventionStatus, notes?: string): Promise<boolean> => runMutation(async (sessionEpoch) => {
    if (!cases.some((item) => item.id === caseId)) throw new Error('The selected case no longer exists.');
    let updated: RecommendedIntervention | undefined;
    if (runtimeConfig.useMockApi) {
      const current = cases.find((item) => item.id === caseId)?.interventions.find((item) => item.id === interventionId);
      if (!current) throw new Error('The selected intervention no longer exists.');
      updated = { ...current, status, actionNotes: notes || current.actionNotes, completedAt: status === 'Completed' ? 'Just now' : current.completedAt };
    } else {
      updated = mapIntervention(await api.post<UnknownRecord>(`interventions/${encodeURIComponent(interventionId)}/status/`, { status, notes: notes ?? '' }));
    }
    if (sessionEpoch !== sessionEpochRef.current) return;
    dataRevisionRef.current += 1;
    setCases((previous) => previous.map((item) => item.id === caseId ? { ...item, interventions: item.interventions.map((intervention) => intervention.id === interventionId ? updated as RecommendedIntervention : intervention) } : item));
  }), [cases, runMutation]);

  const assignIntervention = useCallback((caseId: string, interventionId: string, assignedToId: string): Promise<boolean> => runMutation(async (sessionEpoch) => {
    const target = cases.find((item) => item.id === caseId);
    const current = target?.interventions.find((item) => item.id === interventionId);
    if (!target || !current) throw new Error('The selected intervention no longer exists.');
    const assignee = staffDirectory.find((item) =>
      item.id === assignedToId
      && (item.role === 'COUNSELLOR' || item.role === 'DISTRICT_OFFICER')
    );
    if (!assignee) throw new Error('Select an accessible operational staff account.');
    const updated = runtimeConfig.useMockApi
      ? {
          ...current,
          assignedToId: assignee.id,
          assignedTo: assignee.display_name,
          assignedRole: assignee.designation || assignee.role,
        }
      : mapIntervention(await api.post<UnknownRecord>(`interventions/${encodeURIComponent(interventionId)}/assignment/`, {
          assigned_to_id: assignedToId,
        }));
    if (sessionEpoch !== sessionEpochRef.current) return;
    dataRevisionRef.current += 1;
    setCases((previous) => previous.map((item) => item.id === caseId
      ? { ...item, interventions: item.interventions.map((intervention) => intervention.id === interventionId ? updated : intervention) }
      : item));
  }), [cases, runMutation, staffDirectory]);

  const addRecommendedIntervention = useCallback((caseId: string, newIntervention: Omit<RecommendedIntervention, 'id' | 'recommendedAt'>): Promise<boolean> => runMutation(async (sessionEpoch) => {
    if (!cases.some((item) => item.id === caseId)) throw new Error('The selected case no longer exists.');
    const created = runtimeConfig.useMockApi
      ? { ...newIntervention, id: `demo-intervention-${Date.now()}`, recommendedAt: 'Just now' }
      : mapIntervention(await api.post<UnknownRecord>('interventions/', {
          case_id: caseId,
          type: newIntervention.type,
          title: newIntervention.title,
          description: newIntervention.reason,
          priority: newIntervention.priority,
          ...(newIntervention.assignedToId ? { assigned_to_id: newIntervention.assignedToId } : {}),
          target_date: newIntervention.deadline ?? '',
          notes: newIntervention.actionNotes ?? '',
        }));
    if (sessionEpoch !== sessionEpochRef.current) return;
    dataRevisionRef.current += 1;
    setCases((previous) => previous.map((item) => item.id === caseId ? { ...item, interventions: [created, ...item.interventions] } : item));
  }), [cases, runMutation]);

  const performAlertAction = useCallback((alertId: string, action: 'acknowledge' | 'resolve', notes?: string): Promise<boolean> => runMutation(async (sessionEpoch) => {
    const current = alerts.find((item) => item.id === alertId);
    if (!current) throw new Error('The selected alert no longer exists.');
    const updated = runtimeConfig.useMockApi
      ? { ...current, status: action === 'acknowledge' ? 'Acknowledged' as const : 'Resolved' as const }
      : mapAlert(await api.post<UnknownRecord>(`alerts/${encodeURIComponent(alertId)}/action/`, { action, notes: notes ?? '' }));
    if (sessionEpoch !== sessionEpochRef.current) return;
    dataRevisionRef.current += 1;
    setAlerts((previous) => previous.map((item) => item.id === alertId ? updated : item));
  }), [alerts, runMutation]);
  const acknowledgeAlert = useCallback((alertId: string, notes?: string) => performAlertAction(alertId, 'acknowledge', notes), [performAlertAction]);
  const resolveAlert = useCallback((alertId: string, notes?: string) => performAlertAction(alertId, 'resolve', notes), [performAlertAction]);

  const assignCounsellorToCase = useCallback((caseId: string, counsellorId: string, phone?: string): Promise<boolean> => runMutation(async (sessionEpoch) => {
    const target = cases.find((item) => item.id === caseId);
    if (!target) throw new Error('The selected case no longer exists.');
    const counsellor = staffDirectory.find((item) => item.id === counsellorId && item.role === 'COUNSELLOR');
    if (!counsellor) throw new Error('Select an accessible counsellor from the staff directory.');
    if (runtimeConfig.useMockApi) {
      dataRevisionRef.current += 1;
      setCases((previous) => previous.map((item) => item.id === caseId
        ? { ...item, assignedCounsellor: counsellor.display_name, counsellorPhone: phone || item.counsellorPhone }
        : item));
      return;
    }
    const response = await api.post<UnknownRecord>(`cases/${encodeURIComponent(caseId)}/assign-counsellor/`, {
      counsellor_id: counsellor.id,
      ...(phone ? { phone } : {}),
    });
    if (sessionEpoch !== sessionEpochRef.current) return;
    dataRevisionRef.current += 1;
    setCases((previous) => previous.map((item) => item.id === caseId ? mapCase(response, item) : item));
  }), [cases, runMutation, staffDirectory]);

  const addInteractionToCheckIn = useCallback((caseId: string, interaction: Omit<CaseInteraction, 'id'>): Promise<boolean> => runMutation(async (sessionEpoch) => {
    if (!runtimeConfig.demoMode) throw new Error('Check-in simulation is disabled outside explicit demo mode.');
    const target = cases.find((item) => item.id === caseId);
    if (!target) throw new Error('The selected case no longer exists.');
    if (runtimeConfig.useMockApi) {
      const fullInteraction: CaseInteraction = { ...interaction, id: `demo-interaction-${Date.now()}` };
      const newScore = Math.min(100, Math.max(0, target.distressScore + interaction.distressDelta));
      const newRisk: RiskLevel = newScore >= 80 ? 'CRITICAL' : newScore >= 60 ? 'HIGH' : newScore >= 40 ? 'MODERATE' : 'LOW';
      dataRevisionRef.current += 1;
      setCases((previous) => previous.map((item) => item.id === caseId ? { ...item, distressScore: newScore, riskLevel: newRisk, lastInteractionTime: 'Just now', interactions: [fullInteraction, ...item.interactions] } : item));
      return;
    }
    const voiceStressScore = interaction.voiceStressLevel === 'Severe' ? 90 : interaction.voiceStressLevel === 'Elevated' ? 70 : interaction.voiceStressLevel === 'Moderate' ? 50 : 25;
    const backendChannel = interaction.channel === 'IVRS (Voice)'
      ? 'IVRS'
      : interaction.channel === 'Toll-Free Helpline (14566)'
        ? 'Toll-Free Helpline'
        : interaction.channel;
    const response = await api.post<UnknownRecord>('interactions/simulate/', { case_id: caseId, channel: backendChannel, response_text: interaction.victimResponse, language: 'en', simulated_voice_stress: voiceStressScore });
    if (sessionEpoch !== sessionEpochRef.current) return;
    const received = mapInteraction(response.interaction);
    const newScore = numberValue(response.updatedDistressScore, target.distressScore);
    const newRisk = enumValue(response.updatedRiskLevel, RISK_LEVELS, target.riskLevel);
    dataRevisionRef.current += 1;
    setCases((previous) => previous.map((item) => item.id === caseId ? { ...item, distressScore: newScore, riskLevel: newRisk, lastInteractionTime: received.timestamp || 'Just now', interactions: [received, ...item.interactions] } : item));
  }), [cases, runMutation]);

  const transitionCaseStage = useCallback((caseId: string, stage: CaseStage, notes: string): Promise<boolean> => runMutation(async (sessionEpoch) => {
    const target = cases.find((item) => item.id === caseId);
    if (!target) throw new Error('The selected case no longer exists.');
    if (!notes.trim()) throw new Error('Stage transition evidence is required.');
    const updated = runtimeConfig.useMockApi
      ? { ...target, currentStage: stage }
      : mapCase(await api.post<UnknownRecord>(`cases/${encodeURIComponent(caseId)}/stage/`, {
          stage,
          notes: notes.trim(),
        }), target);
    if (sessionEpoch !== sessionEpochRef.current) return;
    dataRevisionRef.current += 1;
    setCases((previous) => previous.map((item) => item.id === caseId ? updated : item));
  }), [cases, runMutation]);

  const triggerVictimSOS = useCallback(async (caseId: string, threatDetails: string, idempotencyKey: string, location?: string): Promise<SosSubmissionResult> => {
    const sessionEpoch = sessionEpochRef.current;
    const target = cases.find((item) => item.id === caseId);
    if (!target) throw new Error('The selected case no longer exists. The SOS request was not submitted.');
    if (!idempotencyKey) throw new Error('The SOS request could not be safely identified. Close and reopen the SOS form, then try again.');
    setMutationCount((count) => count + 1);
    setError(null);
    try {
      if (runtimeConfig.useMockApi) {
        const newAlert: RiskAlert = { id: `demo-sos-${idempotencyKey}`, caseId: target.id, victimAnonymousId: target.victimAnonymousId, district: target.district, riskLevel: 'CRITICAL', reason: `Demo SOS request: ${threatDetails}`, detectedAt: 'Just now', status: 'Unread', primaryFactor: 'Citizen emergency request recorded in demo mode', recommendations: ['Contact local emergency services if immediate danger continues'], distressScore: 98, previousScore: target.distressScore, assignedCounsellor: target.assignedCounsellor };
        dataRevisionRef.current += 1;
        setAlerts((previous) => previous.some((alert) => alert.id === newAlert.id)
          ? previous
          : [newAlert, ...previous]);
        return { recorded: true, dispatchConfirmed: false, eventId: newAlert.id, providerStatus: 'DEMO_RECORDED', message: 'Demo SOS request recorded. No emergency service was contacted.' };
      }
      const response = await api.post<UnknownRecord>(`cases/${encodeURIComponent(caseId)}/sos/`, {
        threat_details: threatDetails,
        idempotency_key: idempotencyKey,
        location: location ?? 'Location not shared',
      });
      if (sessionEpoch !== sessionEpochRef.current) throw new Error('The authenticated session changed before the SOS response was received.');
      const providerStatus = stringValue(response.dispatchStatus ?? response.dispatch_status, 'NOT_CONFIGURED');
      dataRevisionRef.current += 1;
      setCases((previous) => previous.map((item) => item.id === caseId ? {
        ...item,
        monitoringStatus: 'Elevated',
        lastInteractionTime: 'SOS request recorded just now',
      } : item));
      void loadData(true);
      return {
        recorded: true,
        dispatchConfirmed: false,
        eventId: stringValue(response.eventId) || undefined,
        providerStatus,
        message: providerStatus === 'NOT_CONFIGURED'
          ? 'Your SOS request was recorded, but external emergency dispatch is not configured. Call 112 if you are in immediate danger.'
          : 'Your SOS request was recorded for the response team. This screen does not confirm emergency-service dispatch; call 112 if you are in immediate danger.',
      };
    } catch (sosError) {
      const message = toErrorMessage(sosError);
      if (sessionEpoch === sessionEpochRef.current) setError(message);
      throw new Error(message);
    } finally {
      if (sessionEpoch === sessionEpochRef.current) {
        setMutationCount((count) => Math.max(0, count - 1));
      }
    }
  }, [cases, loadData]);

  const resetFilters = useCallback(() => setFilters(defaultFilters), []);
  const filteredCases = useMemo(() => cases.filter((item) => {
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      if (![item.id, item.victimAnonymousId, item.district, item.caseType, item.currentStage, item.assignedCounsellor].some((value) => value.toLowerCase().includes(query))) return false;
    }
    if (filters.district !== 'All' && item.district !== filters.district) return false;
    if (filters.stage !== 'All' && item.currentStage !== filters.stage) return false;
    if (filters.riskLevel !== 'All' && item.riskLevel !== filters.riskLevel) return false;
    if (filters.caseType !== 'All' && item.caseType !== filters.caseType) return false;
    if (filters.counsellor !== 'All' && !item.assignedCounsellor.toLowerCase().includes(filters.counsellor.toLowerCase())) return false;
    return true;
  }), [cases, filters]);

  const setShowCheckInSimulator = useCallback((show: boolean) => setShowCheckInSimulatorState(runtimeConfig.demoMode ? show : false), []);
  const setShowDemoTour = useCallback((show: boolean) => setShowDemoTourState(runtimeConfig.demoMode ? show : false), []);
  const setDemoStepIndex = useCallback((step: number) => { if (runtimeConfig.demoMode) setDemoStepIndexState(step); }, []);
  const unreadAlertsCount = useMemo(() => alerts.filter((item) => item.status === 'Unread').length, [alerts]);

  const value = useMemo<AppContextType>(() => ({
    userRole, userName, userDistrict, currentUser, setUserRole,
    isAuthenticated: authStatus === 'authenticated', authStatus, isAuthLoading: authStatus === 'bootstrapping',
    login, demoLogin, logout,
    isDemoMode: runtimeConfig.demoMode, usesMockApi: runtimeConfig.useMockApi,
    isDataLoading, isRefreshing, isMutating: mutationCount > 0, error,
    clearError: () => setError(null), refreshData: () => loadData(true),
    cases, getCaseById, loadCaseById, alerts, unreadAlertsCount, auditLogs, districtMetrics, stateMetrics, nationalOverview, staffDirectory, recordTotals,
    updateInterventionStatus, assignIntervention, addRecommendedIntervention, acknowledgeAlert, resolveAlert,
    addInteractionToCheckIn, assignCounsellorToCase, transitionCaseStage, triggerVictimSOS,
    filters, setFilters, resetFilters, filteredCases,
    activeReasoningCase, openReasoningDrawer: setActiveReasoningCase, closeReasoningDrawer: () => setActiveReasoningCase(null),
    activeInterventionModalCase,
    openInterventionModal: (caseItem, intervention) => setActiveInterventionModalCase({ caseItem, intervention }),
    closeInterventionModal: () => setActiveInterventionModalCase(null),
    showCheckInSimulator, setShowCheckInSimulator, showDemoTour, setShowDemoTour, demoStepIndex, setDemoStepIndex,
  }), [userRole, userName, userDistrict, currentUser, setUserRole, authStatus, login, demoLogin, logout, isDataLoading, isRefreshing, mutationCount, error, loadData, cases, getCaseById, loadCaseById, alerts, unreadAlertsCount, auditLogs, districtMetrics, stateMetrics, nationalOverview, staffDirectory, recordTotals, updateInterventionStatus, assignIntervention, addRecommendedIntervention, acknowledgeAlert, resolveAlert, addInteractionToCheckIn, assignCounsellorToCase, transitionCaseStage, triggerVictimSOS, filters, resetFilters, filteredCases, activeReasoningCase, activeInterventionModalCase, showCheckInSimulator, setShowCheckInSimulator, showDemoTour, setShowDemoTour, demoStepIndex, setDemoStepIndex]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
