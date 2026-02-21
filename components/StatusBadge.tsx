import React from 'react';
import { StatusCategory } from '../types';

interface StatusBadgeProps {
  status: StatusCategory;
  text?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text }) => {
  const getStyles = (status: StatusCategory) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'submitted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'draft':
        return 'bg-stone-50 text-stone-600 border-stone-200';
      case 'not-applicable':
        return 'bg-gray-50 text-gray-500 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getDotColor = (status: StatusCategory) => {
    switch (status) {
      case 'approved': return 'bg-emerald-500';
      case 'submitted': return 'bg-blue-500';
      case 'pending': return 'bg-amber-500';
      case 'rejected': return 'bg-red-500';
      case 'draft': return 'bg-stone-400';
      case 'not-applicable': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getLabel = (status: StatusCategory) => {
    if (text) return text;
    switch (status) {
      case 'approved': return 'Approved';
      case 'submitted': return 'Submitted';
      case 'pending': return 'Pending';
      case 'rejected': return 'Action Req';
      case 'draft': return 'Draft';
      case 'not-applicable': return 'N/A';
      default: return status;
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStyles(status)}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${getDotColor(status)} flex-shrink-0`}></span>
      {getLabel(status)}
    </span>
  );
};

export default StatusBadge;
