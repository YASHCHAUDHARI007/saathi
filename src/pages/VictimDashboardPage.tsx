import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  PhoneCall,
  MessageSquare,
  Sparkles,
  HeartHandshake,
  Calendar,
  AlertTriangle,
  FileText,
  Download,
  Mic,
  MicOff,
  CheckCircle2,
  Clock,
  Send,
  Eye,
  EyeOff,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Activity,
  Award,
  BookOpen,
  Volume2,
  RefreshCw,
  MapPin,
  Lock,
  Heart,
  Scale,
  UserCheck,
  Zap,
  Smartphone,
  Laptop,
  Radio,
  Play,
  Square,
  Share2,
  Check,
  Info,
  ChevronDown,
  Navigation,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PRIMARY_DEMO_CASE_ID } from '../config/runtime';

type Language = 'en' | 'hi' | 'mr';
type MobileTab = 'pulse' | 'case' | 'care' | 'grounding';

const SOS_STORAGE_PREFIX = 'saathi.sos.pending.';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const getPendingSosKey = (caseId: string): string => {
  const generatedKey = crypto.randomUUID();
  try {
    const storageKey = `${SOS_STORAGE_PREFIX}${encodeURIComponent(caseId)}`;
    const storedKey = window.sessionStorage.getItem(storageKey);
    if (storedKey && UUID_PATTERN.test(storedKey)) return storedKey;
    window.sessionStorage.setItem(storageKey, generatedKey);
  } catch {
    // The in-memory key still protects a single open page when storage is unavailable.
  }
  return generatedKey;
};

const clearPendingSosKey = (caseId: string): void => {
  try {
    window.sessionStorage.removeItem(`${SOS_STORAGE_PREFIX}${encodeURIComponent(caseId)}`);
  } catch {
    // A confirmed request remains complete even when browser storage is unavailable.
  }
};

interface TranslationMap {
  [key: string]: {
    en: string;
    hi: string;
    mr: string;
  };
}

const translations: TranslationMap = {
  portalTitle: {
    en: 'SAATHI Sahayak',
    hi: 'साथी सहायक',
    mr: 'साथी सहाय्यक',
  },
  portalSubtitle: {
    en: 'Confidential Citizen Care & Protection',
    hi: 'गोपनीय नागरिक कल्याण एवं सुरक्षा',
    mr: 'गोपनीय नागरिक सहाय्यता व सुरक्षा',
  },
  quickExit: {
    en: 'Stealth Exit',
    hi: 'गुप्त निकास',
    mr: 'गुप्त निकास',
  },
  sosButton: {
    en: 'EMERGENCY SOS',
    hi: 'आपातकालीन एसओएस',
    mr: 'धोका / तातडीची मदत',
  },
  sosDescription: {
    en: 'Records an emergency request for review. Call 112 if danger is immediate.',
    hi: 'समीक्षा के लिए आपात अनुरोध दर्ज करता है। तत्काल खतरे में 112 पर कॉल करें।',
    mr: 'पुनरावलोकनासाठी आपत्कालीन विनंती नोंदवते. तातडीच्या धोक्यात 112 वर कॉल करा.',
  },
  todayPulse: {
    en: "Today's Wellbeing Check-in",
    hi: 'आज का मनोस्थिति चेक-इन',
    mr: 'आजची मनःस्थिती नोंदवा',
  },
  feelingPrompt: {
    en: 'How are you feeling right now?',
    hi: 'आज आप कैसा महसूस कर रहे हैं?',
    mr: 'आज तुम्हाला कसे वाटत आहे?',
  },
  caseTrackerTitle: {
    en: 'Your Case & Legal Progress',
    hi: 'आपकी केस एवं न्याय यात्रा',
    mr: 'तुमची केस आणि न्याय प्रक्रिया',
  },
  nextMilestoneTitle: {
    en: 'Upcoming Court Milestone',
    hi: 'अगली अदालत सुनवाई',
    mr: 'पुढील न्यायालयीन तारीख',
  },
  careCircleTitle: {
    en: 'Your Assigned Care Team',
    hi: 'आपका समर्पित सहायता दल',
    mr: 'तुमचे सहाय्यक व समुपदेशक',
  },
  dbtTitle: {
    en: 'Victim Relief (DBT)',
    hi: 'पीड़ित मुआवजा (DBT)',
    mr: 'पीडित नुकसानभरपाई (DBT)',
  },
  calmToolkitTitle: {
    en: '4-7-8 Breathing & Grounding',
    hi: 'मानसिक शांति एवं श्वास क्रिया',
    mr: 'मनःशांती व श्वसन व्यायाम',
  },
  knowYourRights: {
    en: 'Your Legal Rights & Protection',
    hi: 'कानूनी अधिकार एवं सुरक्षा',
    mr: 'कायदेशीर हक्क आणि संरक्षण',
  },
  helplineTitle: {
    en: '24x7 Free Helplines',
    hi: '24x7 निःशुल्क हेल्पलाइन',
    mr: '२४x७ मोफत हेल्पलाईन',
  },
};

export const VictimDashboardPage: React.FC = () => {
  const { getCaseById, cases, addInteractionToCheckIn, triggerVictimSOS, isDemoMode } = useApp();
  const navigate = useNavigate();

  const [lang, setLang] = useState<Language>('en');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(isDemoMode ? PRIMARY_DEMO_CASE_ID : '');
  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>('pulse');
  const [viewMode, setViewMode] = useState<'responsive' | 'mobile_frame'>('responsive');
  const [isCamouflageActive, setIsCamouflageActive] = useState<boolean>(false);
  const [selectedMood, setSelectedMood] = useState<string>(isDemoMode ? 'Anxious' : 'Okay');
  const [checkInText, setCheckInText] = useState<string>('');
  const [checkInTags, setCheckInTags] = useState<string[]>(isDemoMode ? ['Legal stress', 'Trouble sleeping'] : []);
  const [isVoiceRecording, setIsVoiceRecording] = useState<boolean>(false);
  const [voiceSeconds, setVoiceSeconds] = useState<number>(0);
  const [hasSubmittedCheckIn, setHasSubmittedCheckIn] = useState<boolean>(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState<boolean>(false);
  const [sosSent, setSosSent] = useState<boolean>(false);
  const [sosSubmitting, setSosSubmitting] = useState<boolean>(false);
  const [sosMessage, setSosMessage] = useState<string>('');
  const [sosError, setSosError] = useState<string>('');
  const [sosLocationShared, setSosLocationShared] = useState<boolean>(true);
  const [sosIdempotencyKey, setSosIdempotencyKey] = useState<string>('');
  const [breathingStep, setBreathingStep] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathingCount, setBreathingCount] = useState<number>(4);
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);
  const [showDirectChatModal, setShowDirectChatModal] = useState<boolean>(false);
  const [isPlayingAudioGuidance, setIsPlayingAudioGuidance] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'counsellor' | 'victim'; text: string; time: string }>>([
    {
      sender: 'counsellor',
      text: 'Namaste Anjali ji. Dr. Sunita here. I noticed your court hearing is coming up on Thursday. Remember our team and police escort will be with you. How are you holding up today?',
      time: '10:15 AM',
    },
  ]);
  const [newChatMessage, setNewChatMessage] = useState<string>('');

  const caseData = isDemoMode
    ? getCaseById(PRIMARY_DEMO_CASE_ID)
    : cases.find((caseItem) => caseItem.id === selectedCaseId) ?? (cases.length === 1 ? cases[0] : undefined);

  const t = (key: string) => translations[key]?.[lang] || translations[key]?.['en'] || key;

  useEffect(() => {
    setSelectedCaseId((currentCaseId) => {
      if (isDemoMode) return PRIMARY_DEMO_CASE_ID;
      if (currentCaseId && cases.some((caseItem) => caseItem.id === currentCaseId)) return currentCaseId;
      return cases.length === 1 ? cases[0].id : '';
    });
  }, [cases, isDemoMode]);

  // Breathing timer
  useEffect(() => {
    let interval: any;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setBreathingCount((prev) => {
          if (prev <= 1) {
            if (breathingStep === 'Inhale') {
              setBreathingStep('Hold');
              return 7;
            } else if (breathingStep === 'Hold') {
              setBreathingStep('Exhale');
              return 8;
            } else {
              setBreathingStep('Inhale');
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathingActive, breathingStep]);

  // Voice recording timer simulator
  useEffect(() => {
    let timer: any;
    if (isVoiceRecording) {
      timer = setInterval(() => {
        setVoiceSeconds((s) => s + 1);
      }, 1000);
    } else {
      setVoiceSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isVoiceRecording]);

  const handleToggleTag = (tag: string) => {
    setCheckInTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleVoiceRecordToggle = () => {
    if (!isVoiceRecording) {
      setIsVoiceRecording(true);
      setCheckInText(
        lang === 'mr'
          ? 'मला कोर्टाच्या तारखेची भीती वाटते आहे आणि शेजारी धमक्या देत आहेत...'
          : lang === 'hi'
          ? 'मुझे अदालत की तारीख को लेकर डर लग रहा है और लोग दबाव डाल रहे हैं...'
          : 'I am feeling severe anxiety regarding the upcoming court date and receiving indirect threats.'
      );
    } else {
      setIsVoiceRecording(false);
    }
  };

  const handlePlayTTS = (textToRead: string) => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudioGuidance) {
        window.speechSynthesis.cancel();
        setIsPlayingAudioGuidance(false);
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.rate = 0.9;
        utterance.onend = () => setIsPlayingAudioGuidance(false);
        utterance.onerror = () => setIsPlayingAudioGuidance(false);
        setIsPlayingAudioGuidance(true);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      alert(textToRead);
    }
  };

  const handleSubmitCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDemoMode) return;
    if (!caseData || (!checkInText.trim() && checkInTags.length === 0)) return;

    const isThreatRelated =
      checkInTags.includes('Received threat/warning') ||
      checkInText.toLowerCase().includes('threat') ||
      checkInText.includes('धमकी');
    const distressDelta = isThreatRelated
      ? 8
      : selectedMood === 'Scared / Threat'
      ? 10
      : selectedMood === 'Anxious'
      ? 5
      : -4;

    const recorded = await addInteractionToCheckIn(caseData.id, {
      timestamp: 'Just now',
      channel: 'Mobile App',
      prompt: 'Daily Citizen Mobile Wellbeing Pulse',
      victimResponse: checkInText || `Mood: ${selectedMood} • Tags: ${checkInTags.join(', ')}`,
      sentiment: isThreatRelated ? 'Severe Distress' : selectedMood === 'Anxious' ? 'Concern' : 'Neutral',
      threatDetected: isThreatRelated,
      threatKeywords: isThreatRelated ? ['threat', 'intimidation', 'court fear'] : [],
      voiceStressLevel: isVoiceRecording ? 'Elevated' : undefined,
      distressDelta,
      aiSignals: ['Direct mobile citizen pulse', 'Vernacular parsed', 'Assigned counsellor notified'],
      audioDurationSeconds: voiceSeconds > 0 ? voiceSeconds : undefined,
    });

    setHasSubmittedCheckIn(recorded);
    setTimeout(() => {
      setCheckInText('');
    }, 2000);
  };

  const handleTriggerSos = async () => {
    if (!caseData || sosSubmitting) return;
    const idempotencyKey = sosIdempotencyKey || getPendingSosKey(caseData.id);
    if (!sosIdempotencyKey) setSosIdempotencyKey(idempotencyKey);
    setSosSubmitting(true);
    setSosError('');
    setSosMessage('');
    try {
      const result = await triggerVictimSOS(
        caseData.id,
        'Citizen submitted a one-touch emergency SOS request from the SAATHI portal.',
        idempotencyKey,
        sosLocationShared ? 'Location sharing requested; coordinates were not captured by this prototype.' : 'Location not shared by user',
      );
      clearPendingSosKey(caseData.id);
      setSosIdempotencyKey('');
      setSosMessage(result.message);
      setSosSent(true);
    } catch (error) {
      setSosError(error instanceof Error ? error.message : 'The SOS request could not be recorded. Call 112 if you are in immediate danger.');
    } finally {
      setSosSubmitting(false);
    }
  };

  const openSosModal = () => {
    if (!caseData) return;
    setSosSent(false);
    setSosMessage('');
    setSosError('');
    setSosLocationShared(true);
    setSosIdempotencyKey(getPendingSosKey(caseData.id));
    setIsSosModalOpen(true);
  };

  const closeSosModal = () => {
    if (sosSubmitting) return;
    setIsSosModalOpen(false);
    setSosSent(false);
    setSosMessage('');
    setSosError('');
    setSosIdempotencyKey('');
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDemoMode || !newChatMessage.trim()) return;

    const userMsg = {
      sender: 'victim' as const,
      text: newChatMessage,
      time: 'Just now',
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setNewChatMessage('');

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'counsellor',
          text: 'Demo reply only: your message was added to this local prototype conversation. No counsellor or emergency service was contacted.',
          time: 'Just now',
        },
      ]);
    }, 1200);
  };

  if (!caseData && !isDemoMode && cases.length > 1) {
    return (
      <div className="max-w-xl mx-auto p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">Choose the case you need support for</h2>
          <p className="text-xs text-slate-600">
            This account has more than one accessible case. Select the correct case before viewing details or recording an SOS request.
          </p>
        </div>
        <label className="block text-xs font-bold text-slate-700" htmlFor="victim-case-selection">
          Case
        </label>
        <select
          id="victim-case-selection"
          value={selectedCaseId}
          onChange={(event) => setSelectedCaseId(event.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-900"
        >
          <option value="">Select a case</option>
          {cases.map((caseItem) => (
            <option key={caseItem.id} value={caseItem.id}>
              {caseItem.id} — {caseItem.currentStage} — {caseItem.district}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
        <h2 className="text-lg font-bold text-slate-900">No citizen case is assigned</h2>
        <p className="text-xs text-slate-600">The authenticated account does not currently have an accessible case record.</p>
        <button type="button" onClick={() => navigate('/dashboard')} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Return to dashboard</button>
      </div>
    );
  }

  // =========================================================================
  // CAMOUFLAGE / STEALTH MODE VIEW
  // =========================================================================
  if (isCamouflageActive) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-800 p-4 sm:p-8 font-sans selection:bg-emerald-500 selection:text-white">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-between border-b border-slate-300 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                ☀
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900 leading-tight">
                  Maharashtra Agro & Weather (Pune)
                </h1>
                <p className="text-[10px] text-slate-500">Official Agriculture Advisory</p>
              </div>
            </div>

            <button
              onClick={() => setIsCamouflageActive(false)}
              className="text-[11px] font-bold text-slate-600 hover:text-emerald-800 border border-slate-300 bg-white px-3 py-1.5 rounded-xl shadow-xs cursor-pointer flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Resume</span>
            </button>
          </div>

          <div className="space-y-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Today's Temperature</span>
              <div className="text-2xl font-black text-slate-800">28°C • Partly Cloudy</div>
              <p className="text-xs text-emerald-600 font-semibold">Humidity 62% • Rainfall in 48h</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Mandi Rates (Pune APMC)</span>
              <div className="text-xs font-bold text-slate-800">Wheat: ₹2,450 / Qtl • Onion: ₹1,820 / Qtl</div>
              <p className="text-[11px] text-slate-500">Stable agricultural commodity prices this week.</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Drip Irrigation Subsidy</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Contact Taluka Krishi Seva Kendra for 2026 PMKSY schemes registration.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CORE MOBILE CONTENT COMPONENT
  // =========================================================================
  const MobileAppBody = () => (
    <div className="w-full flex flex-col space-y-4">
      {/* 1. STICKY EMERGENCY SOS BAR (THUMB-OPTIMIZED, ALWAYS ACCESSIBLE) */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-rose-700 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-200">
                PoA Sec 15A Protection
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black tracking-tight text-white leading-tight truncate">
              {t('sosButton')}
            </h3>
            <p className="text-[11px] text-rose-100/90 leading-tight line-clamp-1 sm:line-clamp-2">
              {t('sosDescription')}
            </p>
          </div>

          <button
            onClick={openSosModal}
            className="shrink-0 h-12 sm:h-14 px-4 sm:px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-rose-950 flex items-center justify-center gap-2 cursor-pointer transition-all animate-pulse"
          >
            <ShieldAlert className="w-5 h-5 text-white" />
            <span className="hidden sm:inline">Tap for SOS</span>
            <span className="sm:hidden">SOS</span>
          </button>
        </div>
      </div>

      {/* 2. PROTECTED PROFILE STRIP */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-xs flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-slate-900">{caseData.victimAnonymousId}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                {caseData.currentStage}
              </span>
            </div>
            <span className="text-[10px] text-slate-500">{caseData.district}{caseData.firNumber ? ` • ${caseData.firNumber}` : ''}</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Counsellor</span>
          <span className="font-bold text-indigo-700 text-xs">{caseData.assignedCounsellor || 'Unassigned'}</span>
        </div>
      </div>

      {/* 3. MOBILE TAB NAVIGATION BAR (TOUCH FRIENDLY) */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-200/70 rounded-2xl border border-slate-300/60 text-xs font-bold">
        {(isDemoMode ? [
          { id: 'pulse' as MobileTab, label: 'Pulse', icon: Sparkles },
          { id: 'case' as MobileTab, label: 'Case & DBT', icon: Scale },
          { id: 'care' as MobileTab, label: 'Care Team', icon: HeartHandshake },
          { id: 'grounding' as MobileTab, label: 'Grounding', icon: Heart },
        ] : [
          { id: 'pulse' as MobileTab, label: 'Case support', icon: Sparkles },
          { id: 'grounding' as MobileTab, label: 'Grounding', icon: Heart },
        ]).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMobileTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMobileTab(tab.id)}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
              <span className="text-[10px] leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. TAB CONTENTS */}
      {/* ----------------- TAB A: DAILY PULSE (VOICE & TEXT) ----------------- */}
      {activeMobileTab === 'pulse' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 font-['Space_Grotesk']">
                  {t('todayPulse')}
                </h3>
                <p className="text-[11px] text-slate-500">{t('feelingPrompt')}</p>
              </div>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Privacy controls pending review
            </span>
          </div>

          {/* Touch Mood Buttons (Min 44px height) */}
          <div className="grid grid-cols-5 gap-1.5 text-center">
            {[
              { label: 'Safe', emoji: '😊', active: 'bg-emerald-50 border-emerald-400 text-emerald-900' },
              { label: 'Okay', emoji: '😐', active: 'bg-slate-100 border-slate-400 text-slate-900' },
              { label: 'Anxious', emoji: '😟', active: 'bg-amber-50 border-amber-400 text-amber-900' },
              { label: 'Threat', emoji: '😨', active: 'bg-rose-50 border-rose-400 text-rose-900' },
              { label: 'Low', emoji: '😔', active: 'bg-indigo-50 border-indigo-400 text-indigo-900' },
            ].map((m) => (
              <button
                key={m.label}
                type="button"
                onClick={() => setSelectedMood(m.label)}
                disabled={!isDemoMode}
                className={`min-h-[52px] p-2 rounded-2xl border transition-all text-xs font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 flex flex-col items-center justify-center gap-0.5 ${
                  selectedMood === m.label ? `${m.active} ring-2 ring-indigo-500/30` : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <span className="text-xl sm:text-2xl">{m.emoji}</span>
                <span className="text-[9px] font-bold leading-tight truncate w-full">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Situation Tags */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Select Current Circumstances
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Safe at home',
                'Received threat/warning',
                'Legal stress',
                'Trouble sleeping',
                'Need food/ration',
                'Need counsellor call',
              ].map((tag) => {
                const isSelected = checkInTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    disabled={!isDemoMode}
                    className={`min-h-[32px] px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voice Pulse Audio & Vernacular Text Input */}
          <form onSubmit={handleSubmitCheckIn} className="space-y-3 pt-1">
            {!isDemoMode && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                Wellbeing check-in submission is not configured for this deployment. The form is read-only; use the listed helplines or call 112 for immediate danger.
              </div>
            )}
            <div className="relative">
              <textarea
                value={checkInText}
                onChange={(e) => setCheckInText(e.target.value)}
                disabled={!isDemoMode}
                placeholder={
                  lang === 'mr'
                    ? 'येथे लिहा किंवा मराठीत बोला (व्हॉईस नोट)...'
                    : lang === 'hi'
                    ? 'यहाँ लिखें या बोलकर रिकॉर्ड करें...'
                    : 'Type confidentially or record vernacular voice note...'
                }
                rows={3}
                className="w-full p-3 pr-14 text-xs rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 font-medium leading-relaxed disabled:cursor-not-allowed disabled:opacity-60"
              />

              {/* Touch Big Microphone Button (Min 44px touch target) */}
              <button
                type="button"
                onClick={handleVoiceRecordToggle}
                disabled={!isDemoMode}
                className={`absolute right-2.5 bottom-2.5 w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isVoiceRecording
                    ? 'bg-rose-600 text-white animate-pulse shadow-md'
                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                }`}
                title="Vernacular Voice Note"
              >
                {isVoiceRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>

            {/* Voice Recording Waveform Simulation */}
            {isVoiceRecording && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-900 font-semibold animate-fadeIn">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5 h-4">
                    <span className="w-1 bg-rose-600 h-2 animate-bounce" />
                    <span className="w-1 bg-rose-600 h-4 animate-bounce delay-75" />
                    <span className="w-1 bg-rose-600 h-3 animate-bounce delay-150" />
                    <span className="w-1 bg-rose-600 h-5 animate-bounce delay-100" />
                  </div>
                  <span>Recording Voice Pulse ({voiceSeconds}s)...</span>
                </div>
                <button
                  type="button"
                  onClick={handleVoiceRecordToggle}
                  className="px-2.5 py-1 rounded-lg bg-rose-200 text-rose-900 text-[10px] font-bold"
                >
                  Done
                </button>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                {isDemoMode ? 'Demo check-in workflow' : 'Submission integration pending'}
              </span>

              <button
                type="submit"
                disabled={!isDemoMode}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit</span>
              </button>
            </div>

            {hasSubmittedCheckIn && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Check-in recorded by the configured API. Care-team delivery is not confirmed by this screen.</span>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ----------------- TAB B: CASE PROGRESSION & DBT TRACKER ----------------- */}
      {isDemoMode && activeMobileTab === 'case' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Next Court Milestone Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Scale className="w-4 h-4" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 font-['Space_Grotesk']">
                  {t('nextMilestoneTitle')}
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                In 3 Days
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2 text-xs text-amber-950">
              <div className="flex items-center justify-between font-bold">
                <span>Special Atrocity Court No. 4, Pune</span>
                <span className="text-amber-800">29 Aug 2026</span>
              </div>
              <div className="space-y-1 text-[11px]">
                <p>• Time: <strong>10:30 AM (In-Camera Hearing)</strong></p>
                <p>• Special Public Prosecutor: <strong>Adv. V. M. Shinde</strong></p>
                <p>• Escort: <strong>Head Constable Pawar (Arriving 09:00 AM)</strong></p>
              </div>

              {/* Audio Listen Guide */}
              <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                <span className="text-[10px] text-amber-900 font-medium">Plain Marathi/Hindi audio guide:</span>
                <button
                  type="button"
                  onClick={() =>
                    handlePlayTTS(
                      lang === 'mr'
                        ? 'तुमची पुढील सुनावणी २९ ऑगस्ट रोजी सकाळी १०:३० वाजता कोर्ट नंबर ४ मध्ये आहे. तुम्हाला पोलीस संरक्षण पुरवले जाईल.'
                        : 'आपकी अगली अदालत सुनवाई 29 अगस्त को सुबह 10:30 बजे कोर्ट नंबर 4 में है। पुलिस सुरक्षा आपके साथ रहेगी।'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-950 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isPlayingAudioGuidance ? 'Stop' : 'Listen'}</span>
                </button>
              </div>
            </div>

            {/* Case Stepper Grid */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                {t('caseTrackerTitle')}
              </span>
              <div className="grid grid-cols-4 gap-1 text-[10px] font-bold text-center">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ✓ FIR
                </div>
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ✓ Chargesheet
                </div>
                <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
                  ▶ Trial
                </div>
                <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500 border border-slate-200">
                  Final DBT
                </div>
              </div>
            </div>
          </div>

          {/* Victim Compensation DBT Tracker */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 font-['Space_Grotesk']">
                  {t('dbtTitle')}
                </h3>
              </div>
              <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ₹6,18,750 Credited
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-950 block text-[11px]">Stage 1: FIR (25%)</span>
                  <span className="text-[9px] text-emerald-800">SBI A/c •••• 4819</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-800 font-mono">₹2,06,250</span>
                  <span className="text-[9px] font-bold text-emerald-700 block">✓ Credited</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-950 block text-[11px]">Stage 2: Chargesheet (50%)</span>
                  <span className="text-[9px] text-emerald-800">UTR: SBIN99104</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-800 font-mono">₹4,12,500</span>
                  <span className="text-[9px] font-bold text-emerald-700 block">✓ Credited</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between opacity-80">
                <div>
                  <span className="font-bold text-slate-800 block text-[11px]">Stage 3: Judgment (25%)</span>
                  <span className="text-[9px] text-slate-500">Upon Trial Completion</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700 font-mono">₹2,06,250</span>
                  <span className="text-[9px] font-bold text-amber-700 block">⏳ In Progress</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB C: CARE TEAM & 1-TAP CONTACTS ----------------- */}
      {isDemoMode && activeMobileTab === 'care' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 font-['Space_Grotesk']">
                  {t('careCircleTitle')}
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                1-Tap Call
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Counsellor */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    SD
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">Dr. Sunita Deshmukh</h4>
                    <span className="text-[10px] text-slate-500 block truncate">Senior Clinical Counsellor</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isDemoMode && <button
                    onClick={() => setShowDirectChatModal(true)}
                    className="min-h-[40px] px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Chat
                  </button>}
                  <a
                    href="tel:+919823144550"
                    className="min-h-[40px] px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                </div>
              </div>

              {/* Free Legal Aid Panel */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    RK
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">Adv. Rajesh Kamble</h4>
                    <span className="text-[10px] text-slate-500 block truncate">DLSA Free Legal Aid Panel</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href="tel:+919822019283"
                    className="min-h-[40px] px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>DLSA</span>
                  </a>
                </div>
              </div>

              {/* Protection Officer */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    ST
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">Inspector S. Thorat</h4>
                    <span className="text-[10px] text-slate-500 block truncate">Atrocity Special Cell Officer</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href="tel:112"
                    className="min-h-[40px] px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Police</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Helplines Grid */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 shadow-xs space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {t('helplineTitle')}
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <a
                href="tel:14566"
                className="min-h-[48px] p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold flex flex-col items-center justify-center"
              >
                <span className="text-[9px] text-slate-500">SC/ST Line</span>
                <span className="text-xs sm:text-sm font-black">14566</span>
              </a>
              <a
                href="tel:14416"
                className="min-h-[48px] p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold flex flex-col items-center justify-center"
              >
                <span className="text-[9px] text-slate-500">Tele-MANAS</span>
                <span className="text-xs sm:text-sm font-black">14416</span>
              </a>
              <a
                href="tel:112"
                className="min-h-[48px] p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold flex flex-col items-center justify-center"
              >
                <span className="text-[9px] text-slate-500">Police 24x7</span>
                <span className="text-xs sm:text-sm font-black">112</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB D: 4-7-8 CALMING & RIGHTS ----------------- */}
      {activeMobileTab === 'grounding' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Calming Breathing Visualizer */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white rounded-2xl sm:rounded-3xl p-5 border border-slate-800 shadow-md text-center space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 font-['Space_Grotesk']">
                {t('calmToolkitTitle')}
              </span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                4-7-8 Breathing
              </span>
            </div>

            <div className="py-4 flex flex-col items-center justify-center space-y-3">
              <div
                className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-1000 shadow-2xl ${
                  breathingStep === 'Inhale'
                    ? 'scale-110 border-indigo-400 bg-indigo-600/30 shadow-indigo-500/50'
                    : breathingStep === 'Hold'
                    ? 'scale-105 border-amber-400 bg-amber-600/30 shadow-amber-500/50'
                    : 'scale-90 border-emerald-400 bg-emerald-600/30 shadow-emerald-500/50'
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">
                  {breathingStep}
                </span>
                <span className="text-2xl sm:text-3xl font-black font-['Space_Grotesk'] text-white">
                  {breathingCount}s
                </span>
              </div>

              <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
                {breathingStep === 'Inhale'
                  ? 'Breathe in slowly through your nose for 4 seconds...'
                  : breathingStep === 'Hold'
                  ? 'Hold your breath gently for 7 seconds. You are safe.'
                  : 'Exhale completely for 8 seconds. Release tension.'}
              </p>
            </div>

            <button
              onClick={() => setIsBreathingActive(!isBreathingActive)}
              className={`min-h-[44px] px-6 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                isBreathingActive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {isBreathingActive ? 'Pause Exercise' : 'Start 4-7-8 Calming'}
            </button>
          </div>

          {/* Know Your Rights Guide */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 font-['Space_Grotesk']">
                {t('knowYourRights')}
              </h3>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                SC/ST PoA Act
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <strong className="text-slate-900 block text-[11px]">1. Free Legal Aid (Section 15A)</strong>
                No fees for legal counsel or court documentation.
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <strong className="text-slate-900 block text-[11px]">2. Witness Protection & In-Camera Trial</strong>
                Private chamber deposition without intimidation by accused.
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <strong className="text-slate-900 block text-[11px]">3. Government Travel & Diet Allowance</strong>
                Complete transport and daily allowance for every hearing date.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // =========================================================================
  // MAIN WRAPPER (RESPONSIVE OR DESKTOP MOBILE-DEVICE SIMULATOR)
  // =========================================================================
  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-12">
      {/* TOP HEADER: Language Switcher, Camouflage & Device Mode Toggle */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-base sm:text-lg shadow-md shadow-indigo-100 shrink-0">
            सा
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 font-['Space_Grotesk'] truncate">
                {t('portalTitle')}
              </h2>
              <span className="hidden sm:inline-flex text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Prototype privacy review pending
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 truncate">{t('portalSubtitle')}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Vernacular Language Selector */}
          <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer text-[11px] ${
                lang === 'en' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer text-[11px] ${
                lang === 'hi' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              हि
            </button>
            <button
              onClick={() => setLang('mr')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer text-[11px] ${
                lang === 'mr' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              म
            </button>
          </div>

          {/* Desktop Simulator Toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'responsive' ? 'mobile_frame' : 'responsive')}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
            title="Toggle Smartphone Frame view"
          >
            {viewMode === 'responsive' ? <Smartphone className="w-3.5 h-3.5 text-indigo-600" /> : <Laptop className="w-3.5 h-3.5 text-indigo-600" />}
            <span>{viewMode === 'responsive' ? 'Phone Mode' : 'Wide Mode'}</span>
          </button>

          {/* Camouflage Stealth Button */}
          {isDemoMode && <button
            onClick={() => setIsCamouflageActive(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-slate-200 text-[11px] font-bold border border-slate-700 transition-colors shadow-xs cursor-pointer"
            title="Disguises this page as weather report"
          >
            <EyeOff className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{t('quickExit')}</span>
          </button>}
        </div>
      </div>

      {!isDemoMode && cases.length > 1 && (
        <div className="max-w-2xl mx-auto rounded-2xl border border-indigo-200 bg-indigo-50 p-3.5">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-indigo-800 mb-1.5" htmlFor="active-victim-case">
            Active case
          </label>
          <select
            id="active-victim-case"
            value={selectedCaseId}
            onChange={(event) => setSelectedCaseId(event.target.value)}
            className="w-full rounded-xl border border-indigo-200 bg-white p-2.5 text-xs font-bold text-slate-900"
          >
            {cases.map((caseItem) => (
              <option key={caseItem.id} value={caseItem.id}>
                {caseItem.id} — {caseItem.currentStage} — {caseItem.district}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* RENDER VIEW: EITHER NATIVE RESPONSIVE OR SMARTPHONE FRAME SIMULATOR */}
      {viewMode === 'mobile_frame' ? (
        <div className="py-2 flex justify-center">
          {/* Smartphone Bezel */}
          <div className="w-[390px] max-w-full bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 relative">
            {/* Phone Speaker & Camera Notch */}
            <div className="w-32 h-4 bg-slate-950 rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-800" />
            </div>

            {/* Mobile Screen Container */}
            <div className="bg-slate-50 rounded-[32px] overflow-hidden p-3.5 max-h-[720px] overflow-y-auto custom-scrollbar space-y-3">
              <MobileAppBody />
            </div>

            {/* Phone Home Bar */}
            <div className="w-32 h-1 bg-slate-700 rounded-full mx-auto mt-3" />
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <MobileAppBody />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SOS EMERGENCY CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {isSosModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-rose-200 p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto animate-bounce">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 font-['Space_Grotesk']">
                Confirm Emergency SOS Alert?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                This submits an SOS request to the configured SAATHI backend. It does <strong>not</strong> confirm police or ambulance dispatch. Call <strong>112</strong> if danger is immediate.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-left text-xs space-y-1.5 text-rose-950 font-medium">
              <div className="flex items-center justify-between gap-3">
                <span>Case receiving this SOS:</span>
                <strong className="font-mono text-right">{caseData.id}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Request location sharing:</span>
                <input
                  type="checkbox"
                  checked={sosLocationShared}
                  onChange={(e) => setSosLocationShared(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
              </div>
              <p className="text-[10px] text-rose-800">
                This prototype does not capture verified GPS coordinates.
              </p>
            </div>

            {sosSent ? (
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{sosMessage}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closeSosModal}
                    className="min-h-[44px] flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
                  >
                    Close
                  </button>
                  <a
                    href="tel:112"
                    className="min-h-[44px] flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-black flex items-center justify-center"
                  >
                    Call 112
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeSosModal}
                  disabled={sosSubmitting}
                  className="min-h-[44px] flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleTriggerSos()}
                  disabled={sosSubmitting}
                  className="min-h-[44px] flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-rose-900/30 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sosSubmitting ? 'RECORDING…' : 'RECORD SOS'}
                </button>
              </div>
            )}
            {sosError && <div role="alert" className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">{sosError}</div>}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DIRECT COUNSELLOR / LEGAL CHAT MODAL */}
      {/* ========================================================================= */}
      {showDirectChatModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden flex flex-col h-[480px]">
            <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  SD
                </div>
                <div>
                  <h4 className="text-xs font-bold">Dr. Sunita Deshmukh</h4>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Demo conversation only
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowDirectChatModal(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 bg-slate-50 text-xs custom-scrollbar">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'victim' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-2.5 rounded-2xl text-xs ${
                      msg.sender === 'victim'
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    <span
                      className={`text-[9px] block mt-0.5 ${
                        msg.sender === 'victim' ? 'text-indigo-200 text-right' : 'text-slate-400'
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChatMessage} className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={newChatMessage}
                onChange={(e) => setNewChatMessage(e.target.value)}
                placeholder={isDemoMode ? 'Type a demo message…' : 'Messaging is not configured'}
                disabled={!isDemoMode}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!isDemoMode}
                className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
