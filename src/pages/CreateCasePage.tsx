import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FilePlus2,
  Info,
  LoaderCircle,
  Save,
  ShieldCheck,
} from 'lucide-react';
import {
  useApp,
  type CaseMonitoringStatus,
  type CaseSubjectRole,
  type CreateCasePayload,
  type InitialCaseStage,
} from '../context/AppContext';
import { runtimeConfig } from '../config/runtime';
import {
  api,
  toErrorMessage,
  type CollectionResult,
  type StaffDirectoryEntry,
} from '../services/api';
import type { CaseType, PriorityLevel } from '../types';

interface DistrictOption {
  id: string;
  state: string;
  state_name: string;
  name: string;
  code: string;
}

interface CreateCaseFormState {
  id: string;
  anonymous_id: string;
  case_type: CaseType;
  district_id: string;
  subject_role: CaseSubjectRole;
  current_stage: InitialCaseStage;
  monitoring_status: CaseMonitoringStatus;
  priority: PriorityLevel;
  assigned_counsellor_id: string;
  fir_number: string;
  police_station: string;
  special_court: string;
}

const CASE_TYPES: readonly CaseType[] = [
  'Caste-based Violence',
  'Atrocities against SC/ST',
  'Witness Intimidation',
  'Sexual Assault / Rape',
  'Physical Assault',
  'Social Boycott',
  'Land Dispossession',
  'Hate Crime / Verbal Abuse',
];

const SUBJECT_ROLES: readonly CaseSubjectRole[] = ['Victim', 'Witness', 'Family Member'];
const INITIAL_STAGES: readonly InitialCaseStage[] = ['Complaint', 'Investigation'];
const MONITORING_STATUSES: readonly CaseMonitoringStatus[] = ['Active', 'Elevated', 'Under Review', 'Dormant'];
const PRIORITIES: readonly PriorityLevel[] = ['P1', 'P2', 'P3'];

const randomReference = (prefix: string): string => {
  const suffix = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID().replaceAll('-', '').toUpperCase()
    : Date.now().toString(36).toUpperCase();
  return `${prefix}-${suffix}`;
};

const initialForm = (): CreateCaseFormState => ({
  id: randomReference(`ATC-${new Date().getFullYear()}`),
  anonymous_id: randomReference('SUBJECT'),
  case_type: 'Atrocities against SC/ST',
  district_id: '',
  subject_role: 'Victim',
  current_stage: 'Investigation',
  monitoring_status: 'Active',
  priority: 'P2',
  assigned_counsellor_id: '',
  fir_number: '',
  police_station: '',
  special_court: '',
});

const normalizeNextPage = (next: string): string => {
  const apiBase = new URL(`${runtimeConfig.apiBaseUrl.replace(/\/+$/, '')}/`, window.location.origin);
  const nextUrl = new URL(next, apiBase);
  const basePath = apiBase.pathname.replace(/\/+$/, '');
  if (nextUrl.pathname !== basePath && !nextUrl.pathname.startsWith(`${basePath}/`)) {
    throw new Error('The API returned an invalid pagination link.');
  }
  const relativePath = nextUrl.pathname.slice(basePath.length).replace(/^\/+/, '');
  return `${relativePath}${nextUrl.search}`;
};

const loadAllPages = async <T,>(initialPath: string): Promise<T[]> => {
  const items: T[] = [];
  const visited = new Set<string>();
  let path: string | null = initialPath;

  while (path) {
    if (visited.has(path) || visited.size >= 100) {
      throw new Error('The API returned an invalid pagination sequence.');
    }
    visited.add(path);
    const page: CollectionResult<T> = await api.getCollection<T>(path);
    items.push(...page.items);
    path = page.next ? normalizeNextPage(page.next) : null;
  }

  return items;
};

const inputClass = 'min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-hidden transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500';
const labelClass = 'mb-1.5 block text-xs font-bold text-slate-700';

export const CreateCasePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cases,
    createCase,
    currentUser,
    isMutating,
    staffDirectory,
    usesMockApi,
  } = useApp();
  const [form, setForm] = useState<CreateCaseFormState>(initialForm);
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [counsellors, setCounsellors] = useState<StaffDirectoryEntry[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(!usesMockApi);
  const [isLoadingCounsellors, setIsLoadingCounsellors] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [directoryWarning, setDirectoryWarning] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!usesMockApi) return;
    const byDistrict = new Map<string, DistrictOption>();
    const visibleCases = currentUser?.role === 'DISTRICT_OFFICER'
      ? cases.filter((item) => item.district === currentUser.district_name)
      : cases;
    visibleCases.forEach((item, index) => {
      const key = `${item.state}::${item.district}`;
      if (!byDistrict.has(key)) {
        byDistrict.set(key, {
          id: `demo-district-${index + 1}`,
          state: `demo-state-${item.state.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          state_name: item.state,
          name: item.district,
          code: `DEMO-${index + 1}`,
        });
      }
    });
    setDistricts([...byDistrict.values()].sort((a, b) => a.name.localeCompare(b.name)));
    setCounsellors(staffDirectory.filter((staff) => staff.role === 'COUNSELLOR'));
    setIsLoadingOptions(false);
    setIsLoadingCounsellors(false);
    setLoadError(null);
  }, [cases, currentUser?.district_name, currentUser?.role, staffDirectory, usesMockApi]);

  useEffect(() => {
    if (usesMockApi) return;
    let active = true;
    const loadOptions = async (): Promise<void> => {
      setIsLoadingOptions(true);
      setLoadError(null);
      setDirectoryWarning(null);
      try {
        const visibleDistricts = await loadAllPages<DistrictOption>('auth/districts/');
        if (!active) return;
        setDistricts(visibleDistricts);
      } catch (districtError) {
        if (active) {
          setDistricts([]);
          setLoadError(`District choices could not be loaded. ${toErrorMessage(districtError)}`);
        }
      } finally {
        if (active) setIsLoadingOptions(false);
      }
    };
    void loadOptions();
    return () => {
      active = false;
    };
  }, [usesMockApi]);

  useEffect(() => {
    if (usesMockApi) return;
    if (!form.district_id) {
      setCounsellors([]);
      setIsLoadingCounsellors(false);
      return;
    }

    let active = true;
    const loadCounsellors = async (): Promise<void> => {
      setIsLoadingCounsellors(true);
      setDirectoryWarning(null);
      setCounsellors([]);
      try {
        const districtCounsellors = await loadAllPages<StaffDirectoryEntry>(
          `auth/users/?role=COUNSELLOR&district=${encodeURIComponent(form.district_id)}`,
        );
        if (active) setCounsellors(districtCounsellors.filter((staff) => staff.role === 'COUNSELLOR'));
      } catch (staffError) {
        if (active) {
          setDirectoryWarning(`Counsellor directory unavailable. You can create the case unassigned. ${toErrorMessage(staffError)}`);
        }
      } finally {
        if (active) setIsLoadingCounsellors(false);
      }
    };
    void loadCounsellors();
    return () => {
      active = false;
    };
  }, [form.district_id, usesMockApi]);

  useEffect(() => {
    if (districts.length === 0) return;
    setForm((previous) => {
      if (districts.some((district) => district.id === previous.district_id)) return previous;
      const scopedDistrict = currentUser?.district
        ? districts.find((district) => district.id === currentUser.district)
        : undefined;
      // A single-jurisdiction officer can be safely preselected. State and
      // national administrators must make an explicit jurisdiction choice so
      // an intake cannot silently land in the first alphabetical district.
      const defaultDistrict = scopedDistrict ?? (districts.length === 1 ? districts[0] : undefined);
      return {
        ...previous,
        district_id: defaultDistrict?.id ?? '',
        assigned_counsellor_id: '',
      };
    });
  }, [currentUser?.district, districts]);

  const selectedDistrict = useMemo(
    () => districts.find((district) => district.id === form.district_id),
    [districts, form.district_id],
  );

  const eligibleCounsellors = useMemo(
    () => counsellors.filter((staff) => usesMockApi
      ? staff.district_name === selectedDistrict?.name
      : staff.district === form.district_id),
    [counsellors, form.district_id, selectedDistrict?.name, usesMockApi],
  );

  const setField = <K extends keyof CreateCaseFormState>(field: K, value: CreateCaseFormState[K]): void => {
    setSubmitError(null);
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleDistrictChange = (districtId: string): void => {
    setSubmitError(null);
    setForm((previous) => ({
      ...previous,
      district_id: districtId,
      assigned_counsellor_id: '',
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (isSubmitting || isMutating) return;
    setSubmitError(null);

    const caseId = form.id.trim();
    const anonymousId = form.anonymous_id.trim();
    if (!caseId || !anonymousId || !selectedDistrict) {
      setSubmitError('Case ID, anonymous subject ID, and district are required.');
      return;
    }
    if (caseId.length > 100 || anonymousId.length > 100) {
      setSubmitError('Case ID and anonymous subject ID must each be 100 characters or fewer.');
      return;
    }
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/.test(caseId)) {
      setSubmitError('Case ID may contain only letters, numbers, hyphens, and underscores, and must start with a letter or number.');
      return;
    }
    const assignedCounsellor = form.assigned_counsellor_id
      ? eligibleCounsellors.find((staff) => staff.id === form.assigned_counsellor_id)
      : undefined;
    if (form.assigned_counsellor_id && !assignedCounsellor) {
      setSubmitError('The selected counsellor is not available in this district.');
      return;
    }

    const payload: CreateCasePayload = {
      id: caseId,
      anonymous_id: anonymousId,
      case_type: form.case_type,
      district_id: selectedDistrict.id,
      subject_role: form.subject_role,
      current_stage: form.current_stage,
      monitoring_status: form.monitoring_status,
      priority: form.priority,
      ...(assignedCounsellor ? { assigned_counsellor_id: assignedCounsellor.id } : {}),
      ...(form.fir_number.trim() ? { fir_number: form.fir_number.trim() } : {}),
      ...(form.police_station.trim() ? { police_station: form.police_station.trim() } : {}),
      ...(form.special_court.trim() ? { special_court: form.special_court.trim() } : {}),
    };

    setIsSubmitting(true);
    try {
      const created = await createCase(payload, {
        districtName: selectedDistrict.name,
        stateName: selectedDistrict.state_name,
        assignedCounsellorName: assignedCounsellor?.display_name,
      });
      navigate(`/cases/${encodeURIComponent(created.id)}`, {
        replace: true,
        state: { notice: `Case ${created.id} was created successfully.` },
      });
    } catch (createError) {
      setSubmitError(toErrorMessage(createError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitDisabled = isLoadingOptions
    || Boolean(loadError)
    || !selectedDistrict
    || isSubmitting
    || isMutating;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate('/cases')}
            className="mt-0.5 rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Return to case register"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <FilePlus2 className="h-5 w-5 text-indigo-600" />
              <h1 className="font-['Space_Grotesk'] text-xl font-extrabold tracking-tight text-slate-900">
                Create a new case
              </h1>
            </div>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Register the protected case record within your authorized jurisdiction.
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
          <ShieldCheck className="h-4 w-4" /> Authority-only intake
        </div>
      </div>

      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-5" noValidate>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-4">
            <h2 className="text-sm font-extrabold text-slate-900">Protected case identity</h2>
            <p className="mt-1 text-xs text-slate-500">Use a case reference and an opaque pseudonym. Do not enter a person’s name, phone number, address, or other direct identifier.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label>
              <span className={labelClass}>Case ID <span className="text-rose-600">*</span></span>
              <input
                value={form.id}
                onChange={(event) => setField('id', event.target.value)}
                className={inputClass}
                maxLength={100}
                pattern="[A-Za-z0-9][A-Za-z0-9_-]{0,99}"
                required
                autoComplete="off"
                aria-describedby="case-id-help"
              />
              <span id="case-id-help" className="mt-1 block text-[10px] text-slate-500">Must be unique across SAATHI.</span>
            </label>

            <label>
              <span className={labelClass}>Anonymous subject ID <span className="text-rose-600">*</span></span>
              <input
                value={form.anonymous_id}
                onChange={(event) => setField('anonymous_id', event.target.value)}
                className={inputClass}
                maxLength={100}
                required
                autoComplete="off"
                aria-describedby="anonymous-id-help"
              />
              <span id="anonymous-id-help" className="mt-1 block text-[10px] text-slate-500">A new, non-identifying pseudonym for this case.</span>
            </label>

            <label>
              <span className={labelClass}>Subject role <span className="text-rose-600">*</span></span>
              <select
                value={form.subject_role}
                onChange={(event) => setField('subject_role', event.target.value as CaseSubjectRole)}
                className={inputClass}
                required
              >
                {SUBJECT_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-4">
            <h2 className="text-sm font-extrabold text-slate-900">Jurisdiction and classification</h2>
            <p className="mt-1 text-xs text-slate-500">Districts and counsellors are limited to the scope returned by the backend for your account.</p>
          </div>

          {isLoadingOptions && (
            <div role="status" className="mb-4 flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-xs font-semibold text-indigo-800">
              <LoaderCircle className="h-4 w-4 animate-spin" /> Loading authorized choices…
            </div>
          )}
          {loadError && <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">{loadError}</div>}
          {directoryWarning && <div role="status" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">{directoryWarning}</div>}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <label className="md:col-span-2">
              <span className={labelClass}>Case type <span className="text-rose-600">*</span></span>
              <select
                value={form.case_type}
                onChange={(event) => setField('case_type', event.target.value as CaseType)}
                className={inputClass}
                required
              >
                {CASE_TYPES.map((caseType) => <option key={caseType} value={caseType}>{caseType}</option>)}
              </select>
            </label>

            <label>
              <span className={labelClass}>District <span className="text-rose-600">*</span></span>
              <select
                value={form.district_id}
                onChange={(event) => handleDistrictChange(event.target.value)}
                className={inputClass}
                disabled={isLoadingOptions || districts.length === 0}
                required
              >
                <option value="">Select district</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>{district.name}, {district.state_name}</option>
                ))}
              </select>
            </label>

            <label>
              <span className={labelClass}>Initial legal stage <span className="text-rose-600">*</span></span>
              <select
                value={form.current_stage}
                onChange={(event) => setField('current_stage', event.target.value as InitialCaseStage)}
                className={inputClass}
                required
              >
                {INITIAL_STAGES.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
              </select>
              <span className="mt-1 block text-[10px] text-slate-500">Later stages require the audited stage-transition workflow.</span>
            </label>

            <label>
              <span className={labelClass}>Monitoring status <span className="text-rose-600">*</span></span>
              <select
                value={form.monitoring_status}
                onChange={(event) => setField('monitoring_status', event.target.value as CaseMonitoringStatus)}
                className={inputClass}
                required
              >
                {MONITORING_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>

            <label>
              <span className={labelClass}>Priority <span className="text-rose-600">*</span></span>
              <select
                value={form.priority}
                onChange={(event) => setField('priority', event.target.value as PriorityLevel)}
                className={inputClass}
                required
              >
                {PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
              </select>
            </label>

            <label className="md:col-span-2 lg:col-span-3">
              <span className={labelClass}>Assigned counsellor <span className="font-normal text-slate-400">(optional)</span></span>
              <select
                value={form.assigned_counsellor_id}
                onChange={(event) => setField('assigned_counsellor_id', event.target.value)}
                className={inputClass}
                disabled={!selectedDistrict || isLoadingCounsellors || eligibleCounsellors.length === 0}
              >
                <option value="">{isLoadingCounsellors
                  ? 'Loading counsellors for this district…'
                  : eligibleCounsellors.length > 0
                    ? 'Create unassigned'
                    : 'No eligible counsellor available in this district'}</option>
                {eligibleCounsellors.map((staff) => (
                  <option key={staff.id} value={staff.id}>{staff.display_name}{staff.designation ? ` — ${staff.designation}` : ''}</option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-4">
            <h2 className="text-sm font-extrabold text-slate-900">Legal record details</h2>
            <p className="mt-1 text-xs text-slate-500">These fields are optional at intake and can be completed through the case-management workflow.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label>
              <span className={labelClass}>FIR number</span>
              <input value={form.fir_number} onChange={(event) => setField('fir_number', event.target.value)} className={inputClass} maxLength={100} autoComplete="off" />
            </label>
            <label>
              <span className={labelClass}>Police station</span>
              <input value={form.police_station} onChange={(event) => setField('police_station', event.target.value)} className={inputClass} maxLength={100} autoComplete="off" />
            </label>
            <label>
              <span className={labelClass}>Special court</span>
              <input value={form.special_court} onChange={(event) => setField('special_court', event.target.value)} className={inputClass} maxLength={150} autoComplete="off" />
            </label>
          </div>
        </section>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
          <div className="flex items-start gap-2 text-xs text-indigo-950">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
            <p><strong>Privacy checkpoint:</strong> this endpoint stores a pseudonymous subject reference, not direct personal identity data. Confirm that free-text legal fields do not contain unnecessary personal information.</p>
          </div>
        </div>

        {submitError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">{submitError}</div>}

        <div className="flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => navigate('/cases')}
            disabled={isSubmitting}
            className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitDisabled}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white shadow-xs transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {isSubmitting || isMutating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSubmitting || isMutating ? 'Creating case…' : 'Create case'}
          </button>
        </div>
      </form>
    </div>
  );
};
