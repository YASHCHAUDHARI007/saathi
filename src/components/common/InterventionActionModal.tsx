import React, { useEffect, useMemo, useState } from 'react';
import { X, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InterventionStatus, InterventionType, PriorityLevel } from '../../types';

export const InterventionActionModal: React.FC = () => {
  const {
    activeInterventionModalCase,
    closeInterventionModal,
    updateInterventionStatus,
    assignIntervention,
    addRecommendedIntervention,
    staffDirectory,
    currentUser,
    usesMockApi,
  } = useApp();

  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<InterventionStatus | ''>('');
  const [actionNotes, setActionNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // For adding new intervention mode
  const [newType, setNewType] = useState<InterventionType>('Counselling');
  const [newTitle, setNewTitle] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newPriority, setNewPriority] = useState<PriorityLevel | ''>('');

  const interventionId = activeInterventionModalCase?.intervention?.id;
  const caseId = activeInterventionModalCase?.caseItem.id;

  useEffect(() => {
    setAssignedStaffId('');
    setSelectedStatus('');
    setActionNotes('');
    setIsSuccess(false);
    setIsSubmitting(false);
    setSubmitError('');
    setNewType('Counselling');
    setNewTitle('');
    setNewReason('');
    setNewPriority('');
  }, [caseId, interventionId, activeInterventionModalCase?.intervention]);

  const allowedStatusTransitions = useMemo<InterventionStatus[]>(() => {
    const currentStatus = activeInterventionModalCase?.intervention?.status;
    if (currentStatus === 'Pending') return ['In Progress', 'Escalated'];
    if (currentStatus === 'In Progress') return ['Completed', 'Escalated'];
    if (currentStatus === 'Escalated') return ['In Progress', 'Completed'];
    return [];
  }, [activeInterventionModalCase?.intervention?.status]);

  if (!activeInterventionModalCase) return null;

  const { caseItem, intervention } = activeInterventionModalCase;
  const staffCandidates = currentUser
    && (currentUser.role === 'COUNSELLOR' || currentUser.role === 'DISTRICT_OFFICER')
    && !staffDirectory.some((member) => member.id === currentUser.id)
    ? [
        ...staffDirectory,
        {
          id: currentUser.id,
          display_name: [currentUser.first_name, currentUser.last_name].filter(Boolean).join(' ') || currentUser.username,
          role: currentUser.role,
          district: currentUser.district ?? null,
          district_name: currentUser.district_name ?? null,
          designation: currentUser.designation ?? '',
        },
      ]
    : staffDirectory;
  const selectedStaff = staffCandidates.find((member) => member.id === assignedStaffId);
  const assignableStaff = staffCandidates.filter((member) =>
    (member.role === 'COUNSELLOR' || member.role === 'DISTRICT_OFFICER')
    && (usesMockApi || member.district_name === caseItem.district)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError('');

    let saved = false;
    if (intervention) {
      if (selectedStatus === 'Completed' && !actionNotes.trim()) {
        setIsSubmitting(false);
        setSubmitError('Completion requires specific verification or outcome notes.');
        return;
      }
      if (!selectedStaff && !selectedStatus) {
        setIsSubmitting(false);
        setSubmitError('Choose an assignment or an allowed status transition before saving.');
        return;
      }
      if (selectedStaff) {
        const assignmentSaved = await assignIntervention(
          caseItem.id,
          intervention.id,
          selectedStaff.id,
        );
        if (!assignmentSaved) {
          setIsSubmitting(false);
          setSubmitError('The assignment was not saved, so the status transition was not attempted.');
          return;
        }
        saved = true;
      }
      if (selectedStatus) {
        const statusSaved = await updateInterventionStatus(
          caseItem.id,
          intervention.id,
          selectedStatus,
          actionNotes,
        );
        if (!statusSaved && saved) {
          setIsSubmitting(false);
          setSubmitError('The assignment was saved, but the status transition failed. Review the request error before retrying the transition.');
          return;
        }
        saved = statusSaved;
      }
    } else {
      const title = newTitle.trim();
      const reason = newReason.trim();
      if (!title || !reason || !newPriority) {
        setIsSubmitting(false);
        setSubmitError('Enter a specific title and rationale, then choose a priority classification.');
        return;
      }
      saved = await addRecommendedIntervention(caseItem.id, {
        caseId: caseItem.id,
        type: newType,
        title,
        reason,
        priority: newPriority,
        assignedToId: selectedStaff?.id,
        assignedTo: selectedStaff?.display_name || 'Unassigned',
        assignedRole: selectedStaff?.designation || selectedStaff?.role || 'Unassigned',
        status: 'Pending',
        actionNotes,
      });
    }

    setIsSubmitting(false);
    if (!saved) {
      setSubmitError('The intervention was not saved. Review the request error and try again.');
      return;
    }

    setIsSuccess(true);
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
            disabled={isSubmitting}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                <label className="block font-bold text-slate-700 mb-1">Intervention Rationale</label>
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

          <div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Assign Official / Specialist</label>
              <select
                value={assignedStaffId}
                onChange={(e) => setAssignedStaffId(e.target.value)}
                disabled={intervention?.status === 'Completed'}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium disabled:bg-slate-100 disabled:text-slate-500"
              >
                <option value="">
                  {intervention?.status === 'Completed'
                    ? 'Completed intervention — assignment locked'
                    : intervention
                      ? `Keep ${intervention.assignedTo}`
                      : 'Leave unassigned'}
                </option>
                {assignableStaff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.display_name} — {member.designation || member.role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {intervention ? (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Status Transition</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as InterventionStatus | '')}
                  disabled={allowedStatusTransitions.length === 0}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium disabled:bg-slate-100 disabled:text-slate-500"
                >
                  <option value="">
                    {allowedStatusTransitions.length > 0 ? 'No status change' : 'No further transitions'}
                  </option>
                  {allowedStatusTransitions.map((status) => (
                    <option key={status} value={status}>
                      {status === 'Completed' ? 'Mark as Completed' : status}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Status</label>
                <div className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-600">
                  Pending
                </div>
              </div>
            )}

            {!intervention && (
              <div>
              <label className="block font-bold text-slate-700 mb-1">Priority Classification</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as PriorityLevel | '')}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium"
                required
              >
                <option value="" disabled>Select priority classification</option>
                <option value="P1">P1 (Immediate / Within 4 Hours)</option>
                <option value="P2">P2 (Urgent / Within 24 Hours)</option>
                <option value="P3">P3 (Routine / Within 72 Hours)</option>
              </select>
              </div>
            )}
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

          {submitError && (
            <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-rose-800">
              {submitError}
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeInterventionModal}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSuccess || isSubmitting}
              className="px-5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> Saved — Close When Ready
                </>
              ) : isSubmitting ? (
                'Saving…'
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
