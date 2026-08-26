import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquareHeart,
  Bot,
  PhoneCall,
  Smartphone,
  MessageSquare,
  Sparkles,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  Mic,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CommunicationChannel } from '../types';

export const CheckInsPage: React.FC = () => {
  const { cases, setShowCheckInSimulator } = useApp();
  const navigate = useNavigate();

  const [selectedChannel, setSelectedChannel] = useState<'All' | CommunicationChannel>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all interactions across all cases
  const allInteractions = cases.flatMap((c) =>
    c.recentInteractions.map((inter) => ({ ...inter, caseItem: c }))
  );

  const filteredInteractions = allInteractions.filter((i) => {
    if (selectedChannel !== 'All' && i.channel !== selectedChannel) return false;
    if (
      searchQuery &&
      !i.victimResponse.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !i.caseItem.id.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const channels: { channel: CommunicationChannel; label: string; icon: any; share: string; count: number }[] = [
    { channel: 'Chatbot', label: 'Chatbot (WhatsApp / Web)', icon: Bot, share: '48%', count: 512 },
    { channel: 'IVRS (Voice)', label: 'Automated IVRS Voice', icon: PhoneCall, share: '28%', count: 298 },
    { channel: 'SMS', label: 'SMS Gateway', icon: MessageSquare, share: '14%', count: 149 },
    { channel: 'Mobile App', label: 'Citizen Mobile App', icon: Smartphone, share: '10%', count: 108 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquareHeart className="w-5 h-5 text-indigo-600" />
            <h1 className="text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk']">
              Multi-Channel Interaction & Check-in Stream
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Ingestion of low-friction wellbeing pulses across WhatsApp, voice IVRS, SMS, and dedicated citizen apps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCheckInSimulator(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Check-in Simulator</span>
          </button>
        </div>
      </div>

      {/* Multi-Channel Protocol Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {channels.map((ch) => {
          const Icon = ch.icon;
          const isSelected = selectedChannel === ch.channel;

          return (
            <div
              key={ch.channel}
              onClick={() => setSelectedChannel(isSelected ? 'All' : ch.channel)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-500/30'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {ch.share} Volume
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold leading-snug">{ch.label}</h4>
                <p className={`text-[11px] mt-1 ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                  {ch.count} Interactions this month
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Stream Register Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Interaction Signal Stream & Multi-Modal NLP Extract
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              ({filteredInteractions.length} logs)
            </span>
          </div>

          <div className="w-full sm:w-64 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transcript text..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* Interaction Log Cards */}
        <div className="space-y-3">
          {filteredInteractions.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/cases/${item.caseItem.id}`)}
              className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-white transition-all space-y-2.5 text-xs shadow-xs cursor-pointer group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-indigo-700 font-mono group-hover:underline">
                    {item.caseItem.id}
                  </span>
                  <span className="text-slate-600 font-medium">({item.caseItem.victimAnonymousId})</span>
                  <span className="text-[10px] font-bold text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded">
                    {item.channel}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{item.timestamp}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.threatDetected && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600" /> Threat Flagged
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                      item.distressDelta > 0
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    Δ {item.distressDelta > 0 ? `+${item.distressDelta}` : item.distressDelta} pts
                  </span>
                </div>
              </div>

              {/* Interaction prompt and response */}
              <div className="p-3 rounded-lg bg-white border border-slate-200/80 space-y-1">
                <div className="text-slate-500 italic text-[11px]">
                  <strong>System Prompt:</strong> "{item.prompt}"
                </div>
                <div className="text-slate-900 font-semibold text-xs">
                  <strong>Subject Response:</strong> "{item.victimResponse}"
                </div>
              </div>

              {/* AI Multi-modal signals */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
                <div className="flex items-center gap-3">
                  <span>Sentiment: <strong className="text-slate-800">{item.sentiment}</strong></span>
                  <span>•</span>
                  <span>Voice Stress: <strong className="text-slate-800">{item.voiceStressLevel}</strong></span>
                  {item.threatKeywords.length > 0 && (
                    <>
                      <span>•</span>
                      <span>Keywords: <strong className="text-rose-600">{item.threatKeywords.join(', ')}</strong></span>
                    </>
                  )}
                </div>

                <span className="font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  View Full Case File <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
