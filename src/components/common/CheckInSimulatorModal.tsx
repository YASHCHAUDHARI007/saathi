import React, { useState } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Mic,
  Smartphone,
  PhoneCall,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CommunicationChannel } from '../../types';

export const CheckInSimulatorModal: React.FC = () => {
  const { showCheckInSimulator, setShowCheckInSimulator, cases, addInteractionToCheckIn } = useApp();

  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id || 'ATC-2026-10482');
  const [channel, setChannel] = useState<CommunicationChannel>('Chatbot');
  const [presetType, setPresetType] = useState<'threat' | 'anxiety' | 'positive' | 'custom'>('threat');
  const [customText, setCustomText] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{ message: string; success: boolean } | null>(null);

  if (!showCheckInSimulator) return null;

  const presets = {
    threat: {
      prompt: 'How are you feeling today and is your home secure?',
      response:
        'I am very scared. Unknown men were taking photos outside our gate this morning and shouting our name.',
      sentiment: 'Severe Distress' as const,
      threatDetected: true,
      threatKeywords: ['unknown men', 'taking photos', 'shouting', 'scared'],
      voiceStressLevel: 'Elevated' as const,
      distressDelta: +12,
      aiSignals: [
        'Active surveillance/threat keywords detected (+12 pts)',
        'Vocal anxiety jitter flagged',
        'Urgent police witness protection alert triggered',
      ],
    },
    anxiety: {
      prompt: 'Are you ready for your upcoming court hearing on Thursday?',
      response:
        'I cannot sleep or eat. My hands tremble whenever I think of standing in front of the judge and lawyers.',
      sentiment: 'Negative' as const,
      threatDetected: false,
      threatKeywords: ['cannot sleep', 'tremble', 'hands'],
      voiceStressLevel: 'Moderate' as const,
      distressDelta: +8,
      aiSignals: [
        'Acute anticipatory trial anxiety',
        'Somatic stress markers (insomnia, tremors)',
        'Pre-trial desensitization counselling recommended',
      ],
    },
    positive: {
      prompt: 'How is the recovery progress and your child’s school attendance?',
      response:
        'Things are much calmer now. We received the livelihood grant and my daughter returned to school safely.',
      sentiment: 'Positive' as const,
      threatDetected: false,
      threatKeywords: [],
      voiceStressLevel: 'Low' as const,
      distressDelta: -10,
      aiSignals: [
        'Positive stabilization trend (-10 pts)',
        'Rehabilitation support effectively mitigating trauma',
        'Step-down monitoring cadence eligible',
      ],
    },
  };

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationResult(null);

    const data =
      presetType === 'custom'
        ? {
            prompt: 'Periodic wellbeing pulse',
            response: customText || 'I am doing fine today.',
            sentiment: 'Neutral' as const,
            threatDetected: customText.toLowerCase().includes('threat') || customText.toLowerCase().includes('kill'),
            threatKeywords: customText.toLowerCase().includes('threat') ? ['threat'] : [],
            voiceStressLevel: 'Low' as const,
            distressDelta: customText.toLowerCase().includes('afraid') ? +6 : -2,
            aiSignals: ['Custom prompt evaluated by multi-modal NLP pipeline'],
          }
        : presets[presetType];

    const processed = await addInteractionToCheckIn(selectedCaseId, {
      timestamp: 'Just now (Simulated)',
      channel,
      prompt: data.prompt,
      victimResponse: data.response,
      sentiment: data.sentiment,
      threatDetected: data.threatDetected,
      threatKeywords: data.threatKeywords,
      voiceStressLevel: data.voiceStressLevel,
      distressDelta: data.distressDelta,
      aiSignals: data.aiSignals,
    });

    setIsSimulating(false);
    if (!processed) {
      setSimulationResult({ message: 'The demo interaction was not processed. Confirm that backend simulator endpoints are explicitly enabled.', success: false });
      return;
    }

    setSimulationResult({
      message: `Demo interaction processed for ${selectedCaseId}. The returned case state has been applied.`,
      success: true,
    });

    setTimeout(() => {
      setSimulationResult(null);
      setShowCheckInSimulator(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Demo Multi-Modal Check-in Simulator</h3>
              <p className="text-xs text-slate-300">Simulate incoming victim responses & watch dynamic AI scoring</p>
            </div>
          </div>
          <button
            onClick={() => setShowCheckInSimulator(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSimulate} className="p-6 space-y-4 text-xs text-slate-800">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Target Case for Simulation</label>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-xs"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} — {c.victimAnonymousId} ({c.district} • {c.caseType} • Current: {c.distressScore}/100)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Communication Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as CommunicationChannel)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-xs"
              >
                <option value="Chatbot">Chatbot (WhatsApp / Web)</option>
                <option value="IVRS (Voice)">IVRS (Voice Automated)</option>
                <option value="SMS">SMS Gateway</option>
                <option value="Mobile App">Mobile Citizen App</option>
                <option value="Toll-Free Helpline (14566)">Toll-Free Helpline (14566)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Simulation Preset</label>
              <select
                value={presetType}
                onChange={(e) => setPresetType(e.target.value as any)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-xs"
              >
                <option value="threat">🚨 Escalation (Threat Detected +12 pts)</option>
                <option value="anxiety">⚠️ Anticipatory Trial Anxiety (+8 pts)</option>
                <option value="positive">✅ Resilience / Stabilization (-10 pts)</option>
                <option value="custom">✏️ Custom Victim Response</option>
              </select>
            </div>
          </div>

          {presetType !== 'custom' ? (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">System Prompt Sent</span>
                <p className="text-slate-700 italic font-medium">{presets[presetType].prompt}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Victim / Witness Reply</span>
                <p className="text-slate-900 font-semibold">"{presets[presetType].response}"</p>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
                <span
                  className={`font-bold px-2 py-0.5 rounded ${
                    presets[presetType].distressDelta > 0
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  Delta: {presets[presetType].distressDelta > 0 ? '+' : ''}
                  {presets[presetType].distressDelta} pts
                </span>
                <span className="text-slate-500">• Sentiment: {presets[presetType].sentiment}</span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Custom Victim Reply</label>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Type sample message here..."
                rows={3}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>
          )}

          {simulationResult && (
            <div className={`p-3 rounded-lg border flex items-center gap-2 text-xs font-semibold ${simulationResult.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>
              {simulationResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
              {simulationResult.message}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCheckInSimulator(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSimulating}
              className="px-5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSimulating ? (
                'Processing Multi-Modal Signals...'
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Submit Demo Interaction
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
