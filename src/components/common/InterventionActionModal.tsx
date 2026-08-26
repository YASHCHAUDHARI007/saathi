import React, { useState } from 'react';
import { X, HeartHandshake, ShieldCheck, UserCheck, Calendar, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InterventionStatus, InterventionType, PriorityLevel } from '../../types';

export const InterventionActionModal: React.FC = () => {
  const {
    activeInterventionModalCase,
    closeInterventionModal,
    updateInterventionStatus,
    assignIntervention,
    addRecommendedIntervention,
  } = useApp();

  const [assignedOfficer, setAssignedOfficer] = useState('');
  const [selectedRole, setSelectedRole] = useState('District Senior Counsellor');
  const [selectedStatus, setSelectedStatus] = useState<InterventionStatus>('In Progress');
  const [actionNotes, setActionNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // For adding new intervention mode
  const [newType, setNewType] = useState<InterventionType>('Counselling');
  const [newTitle, setNewTitle] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newPriority, setNewPriority] = useState<PriorityLevel>('P1');

  if (!activeInterventionModalCase) return null;

  const { caseItem, intervention } = activeInterventionModalCase;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (intervention) {
      if (assignedOfficer) {
        assignIntervention(caseItem.id, intervention.id, assignedOfficer, selectedRole);
      }
      updateInterventionStatus(caseItem.id, intervention.id, selectedStatus, actionNotes);
    } else {
      // Create new
      addRecommendedIntervention(caseItem.id, {
        caseId: caseItem.id,
        type: newType,
        title: newTitle || `${newType} Intervention`,
        reason: newReason || 'Officer initiated supportive intervention.',
        priority: newPriority,
        assignedTo: assignedOfficer || 'Assigned Officer',
        assignedRole: selectedRole,
        status: selectedStatus,
        actionNotes,
      });
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      closeInterventionModal();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {intervention ? 'Update Intervention Action' : 'Initiate New Case Intervention'}
              </h3>
              <p className="text-xs text-slate-300">
                Case {caseItem.id} • {caseItem.victimAnonymousId}
              </p>
            </div>
          </div>
          <button
            onClick={closeInterventionModal}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-800 text-xs">
          {intervention ? (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-1">
                {intervention.type} Intervention
              </span>
              <h4 className="text-sm font-bold text-slate-900 mb-1">{intervention.title}</h4>
              <p className="text-slate-600 leading-relaxed mb-2">{intervention.reason}</p>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                <span>Priority: <strong className="text-slate-800">{intervention.priority}</strong></span>
                <span>•</span>
                <span>Current: <strong className="text-slate-800">{intervention.status}</strong></span>
                <span>•</span>
                <span>Assigned: <strong className="text-slate-800">{intervention.assignedTo}</strong></span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Intervention Category</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as InterventionType)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium"
                >
                  <option value="Counselling">Counselling & Mental Wellbeing</option>
                  <option value="Witness Protection">Witness Protection (WPS-2018)</option>
                  <option value="Medical Treatment">Medical Treatment & Forensics</option>
                  <option value="Relocation Support">Safe Transit & Relocation Support</option>
                  <option value="Financial Assistance">Direct Benefit Compensation / Relief</option>
                  <option value="Legal Aid">Special Public Prosecutor / DLSA Legal Aid</option>
                  <option value="Rehabilitation">Livelihood & Socio-Economic Rehabilitation</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Title / Order Name</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. In-person emergency trauma counselling session"
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Intervention Reason</label>
                <textarea
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="Explain why this intervention is scheduled..."
                  rows={2}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                  required
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Assign Official / Specialist</label>
              <input
                type="text"
                value={assignedOfficer}
                onChange={(e) => setAssignedOfficer(e.target.value)}
                placeholder={intervention?.assignedTo || 'Dr. Sunita Deshmukh'}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Official Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium"
              >
                <option value="District Senior Clinical Counsellor">District Senior Clinical Counsellor</option>
                <option value="DSP SC/ST Protection Cell">DSP SC/ST Protection Cell</option>
                <option value="DLSA Legal Aid Counsel">DLSA Legal Aid Counsel</option>
                <option value="District Social Welfare Officer">District Social Welfare Officer</option>
                <option value="Medical Superintendent">Medical Superintendent</option>
                <option value="Sub-Divisional Magistrate">Sub-Divisional Magistrate</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Status Transition</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as InterventionStatus)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Mark as Completed</option>
                <option value="Escalated">Escalate to State Level</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Priority Classification</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as PriorityLevel)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium"
              >
                <option value="P1">P1 (Immediate / Within 4 Hours)</option>
                <option value="P2">P2 (Urgent / Within 24 Hours)</option>
                <option value="P3">P3 (Routine / Within 72 Hours)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Intervention Action Notes</label>
            <textarea
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="Record actions taken, victim response, or scheduled appointment time..."
              rows={2}
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeInterventionModal}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSuccess}
              className="px-5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> Saved Successfully!
                </>
              ) : (
                'Save Intervention Record'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
