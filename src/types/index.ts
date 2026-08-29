export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type CaseStage =
  | 'Complaint'
  | 'Investigation'
  | 'Trial'
  | 'Judgment'
  | 'Compensation'
  | 'Rehabilitation'
  | 'Closure';

export type CaseType =
  | 'Caste-based Violence'
  | 'Atrocities against SC/ST'
  | 'Witness Intimidation'
  | 'Sexual Assault / Rape'
  | 'Physical Assault'
  | 'Social Boycott'
  | 'Land Dispossession'
  | 'Hate Crime / Verbal Abuse';

export type UserRole =
  | 'District Officer'
  | 'Counsellor'
  | 'State Administrator'
  | 'National Administrator'
  | 'Victim / Citizen';

export type CommunicationChannel =
  | 'Chatbot'
  | 'IVRS (Voice)'
  | 'SMS'
  | 'Mobile App'
  | 'Web Portal'
  | 'Toll-Free Helpline (14566)';

export type InterventionType =
  | 'Counselling'
  | 'Medical Treatment'
  | 'Witness Protection'
  | 'Relocation Support'
  | 'Financial Assistance'
  | 'Legal Aid'
  | 'Rehabilitation';

export type InterventionStatus = 'Pending' | 'In Progress' | 'Completed' | 'Escalated';

export type PriorityLevel = 'P1' | 'P2' | 'P3';

export interface ContributingFactor {
  id: string;
  factor: string;
  points: number; // e.g. +18
  category: 'Trend' | 'Sentiment' | 'Threat' | 'Engagement' | 'Behavioral';
  description: string;
}

export interface LongitudinalDataPoint {
  date: string;
  weekLabel?: string;
  distressScore: number;
  engagementScore: number;
  sentimentScore: number; // -100 to +100
  threatSignalScore: number; // 0 to 100
  checkInFrequency: number;
  interventionImpact?: number;
  detectedSignal?: string;
  caseStage: CaseStage;
  notes?: string;
}

export interface CaseMilestone {
  stage: CaseStage;
  title: string;
  date: string;
  completed: boolean;
  isCurrent: boolean;
  distressTrend: string;
  interventions: string[];
  importantEvents: string[];
}

export interface CaseInteraction {
  id: string;
  timestamp: string;
  channel: CommunicationChannel;
  prompt: string;
  victimResponse: string;
  sentiment: 'Positive' | 'Neutral' | 'Concern' | 'Negative' | 'Severe Distress';
  threatDetected: boolean;
  threatKeywords: string[];
  voiceStressLevel?: 'Low' | 'Moderate' | 'Elevated' | 'Severe';
  distressDelta: number;
  aiSignals: string[];
  audioDurationSeconds?: number;
}

export interface RecommendedIntervention {
  id: string;
  caseId: string;
  assignedToId?: string;
  type: InterventionType;
  title: string;
  reason: string;
  priority: PriorityLevel;
  assignedTo: string;
  assignedRole: string;
  status: InterventionStatus;
  recommendedAt: string;
  deadline?: string;
  completedAt?: string;
  actionNotes?: string;
}

export interface RiskAlert {
  id: string;
  caseId: string;
  victimAnonymousId: string;
  district: string;
  riskLevel: RiskLevel;
  reason: string;
  detectedAt: string;
  status: 'Unread' | 'Acknowledged' | 'Resolved';
  primaryFactor: string;
  recommendations: string[];
  distressScore: number;
  previousScore: number;
  assignedCounsellor: string;
}

export interface AlertTimelineEvent {
  id: string;
  time: string;
  date: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
}

export interface CaseItem {
  id: string; // e.g. ATC-2026-10482
  victimAnonymousId: string; // e.g. Anonymous Subject #V-8942
  subjectRole: 'Victim' | 'Witness' | 'Family Member';
  caseType: CaseType;
  district: string;
  state: string;
  currentStage: CaseStage;
  distressScore: number; // 0-100
  previousDistressScore: number; // 7 days ago
  baselineScore: number;
  riskLevel: RiskLevel;
  trend: string; // e.g. '↑ +14 (7d)'
  trendDirection: 'increasing' | 'stable' | 'decreasing';
  lastInteractionTime: string;
  assignedCounsellor: string;
  assignedCounsellorId?: string;
  counsellorPhone?: string;
  firNumber?: string;
  policeStation?: string;
  specialCourt?: string;
  priority: PriorityLevel;
  monitoringStatus: 'Active' | 'Elevated' | 'Under Review' | 'Dormant';
  
  // Multimodal signals
  textSentiment: 'Positive' | 'Neutral' | 'Negative' | 'High Distress';
  distressLanguageStatus: 'Normal' | 'Elevated' | 'Critical';
  voiceStressStatus: 'Normal' | 'Moderate' | 'Elevated' | 'Severe';
  emotionSignal: 'Calm' | 'Apprehensive' | 'Concern' | 'Fear' | 'Despair';
  engagementRateChange: string; // e.g. '↓ 32%'
  missedFollowUps: number;
  responseFrequency: 'Active' | 'Declining' | 'Sporadic' | 'Unresponsive';
  
  // Explainability
  contributingFactors: ContributingFactor[];
  primaryContributingFactor: string;
  aiExplanationSummary: string;
  
  // Datasets
  longitudinalTrajectory: LongitudinalDataPoint[];
  milestones: CaseMilestone[];
  interactions: CaseInteraction[];
  interventions: RecommendedIntervention[];
  alertTimeline: AlertTimelineEvent[];
}

export interface DistrictMetric {
  name: string;
  state: string;
  activeCases: number;
  monitoringCases: number;
  highRiskCases: number;
  criticalCases: number;
  avgDistressScore: number | null;
  interventionsCompleted: number;
  followUpsDue: number;
  riskLevel: RiskLevel | null;
  riskEscalationRate: string;
  counsellorRatio: string;
  coordinates: { x: number; y: number }; // For canvas / grid visualization
}

export interface StateMetric {
  stateName: string;
  totalActiveCases: number;
  casesUnderMonitoring: number;
  avgDistressScore: number;
  highRiskPercentage: number;
  avgInterventionResponseHours: number;
  missedFollowUpRate: number;
  districtsCount: number;
  trend: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  caseId: string;
  ipAddress: string;
  status: 'Success' | 'Flagged' | 'Denied';
  details: string;
}

export interface ReportTemplate {
  id: string;
  title: string;
  category: string;
  frequency: string;
  lastGenerated: string;
  description: string;
  recordsIncluded: number;
}
