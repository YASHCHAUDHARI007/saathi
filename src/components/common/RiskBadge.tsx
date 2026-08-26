import React from 'react';
import { RiskLevel, PriorityLevel, InterventionStatus, CaseStage } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = 'md',
  showPulse = false,
  className = '',
}) => {
  const getStyles = () => {
    switch (level) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
          dot: 'bg-rose-600',
          label: 'CRITICAL RISK',
        };
      case 'HIGH':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200 ring-amber-500/20',
          dot: 'bg-amber-600',
          label: 'HIGH RISK',
        };
      case 'MODERATE':
        return {
          bg: 'bg-yellow-50 text-yellow-800 border-yellow-200 ring-yellow-500/20',
          dot: 'bg-yellow-600',
          label: 'MODERATE RISK',
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
          dot: 'bg-emerald-600',
          label: 'LOW RISK',
        };
    }
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-semibold gap-1.5',
    md: 'text-xs px-2.5 py-1 font-semibold gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 font-bold gap-2',
  };

  const styles = getStyles();

  return (
    <span
      className={`inline-flex items-center rounded-full border whitespace-nowrap tracking-wide uppercase transition-colors ${styles.bg} ${sizeClasses[size]} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {showPulse && (level === 'CRITICAL' || level === 'HIGH') && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${styles.dot}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${styles.dot}`} />
      </span>
      {styles.label}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: PriorityLevel }> = ({ priority }) => {
  const styles = {
    P1: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
    P2: 'bg-amber-100 text-amber-800 border-amber-300 font-medium',
    P3: 'bg-slate-100 text-slate-700 border-slate-300 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs rounded border whitespace-nowrap ${styles[priority]}`}
    >
      {priority} Priority
    </span>
  );
};

export const StatusBadge: React.FC<{ status: InterventionStatus }> = ({ status }) => {
  const styles = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Escalated: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border whitespace-nowrap ${styles[status]}`}
    >
      {status}
    </span>
  );
};

export const StageBadge: React.FC<{ stage: CaseStage; isCurrent?: boolean }> = ({
  stage,
  isCurrent = false,
}) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs rounded-md font-medium whitespace-nowrap transition-all ${
        isCurrent
          ? 'bg-indigo-600 text-white shadow-xs font-semibold'
          : 'bg-slate-100 text-slate-700 border border-slate-200'
      }`}
    >
      {stage}
    </span>
  );
};
