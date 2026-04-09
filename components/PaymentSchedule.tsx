import React, { useState } from 'react';
import { PaymentSchedule as PaymentScheduleType } from '../types';
import { DollarSign, ChevronDown, ChevronRight, TrendingUp, FileText, Landmark, HardHat } from 'lucide-react';

interface PaymentScheduleProps {
  schedule: PaymentScheduleType | undefined;
  agreementName: string;
}

const GROUP_META: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  A: { label: 'Investigation', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: FileText },
  B: { label: 'Design', color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200', icon: TrendingUp },
  C: { label: 'Tender', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: Landmark },
  D: { label: 'Construction', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: HardHat },
};

const fmtCurrency = (v: number | null) => {
  if (v === null) return '-';
  return `HK$${v.toLocaleString()}`;
};

const PaymentScheduleComponent: React.FC<PaymentScheduleProps> = ({ schedule, agreementName }) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ A: true, B: true, C: true, D: true });

  if (!schedule) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No payment schedule available</p>
          <p className="text-sm mt-1">Payment schedule has not been set up for {agreementName}</p>
        </div>
      </div>
    );
  }

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const groups = ['A', 'C', 'B', 'D'];
  const groupActivities = (group: string) => schedule.activities.filter(a => a.group === group && !a.isGroup);
  const groupHeader = (group: string) => schedule.activities.find(a => a.group === group && a.isGroup);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tendered Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{fmtCurrency(schedule.tenderedTotal)}</p>
        </div>
        {groups.filter(g => g !== 'D' || true).slice(0, 3).map(g => {
          const header = groupHeader(g);
          const meta = GROUP_META[g];
          if (!header) return null;
          return (
            <div key={g} className={`bg-white rounded-xl border ${meta.border} p-4 shadow-sm`}>
              <p className={`text-xs font-semibold uppercase tracking-wider ${meta.color} opacity-70`}>Group {g} - {meta.label}</p>
              <p className={`text-2xl font-bold mt-1 ${meta.color}`}>{fmtCurrency(header.totalAmount)}</p>
              <p className="text-xs text-gray-400 mt-0.5">{header.pricePercent}% of total</p>
            </div>
          );
        })}
      </div>

      {/* Group D summary card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(() => {
          const header = groupHeader('D');
          const meta = GROUP_META['D'];
          if (!header) return null;
          return (
            <div className={`bg-white rounded-xl border ${meta.border} p-4 shadow-sm`}>
              <p className={`text-xs font-semibold uppercase tracking-wider ${meta.color} opacity-70`}>Group D - {meta.label}</p>
              <p className={`text-2xl font-bold mt-1 ${meta.color}`}>{fmtCurrency(header.totalAmount)}</p>
              <p className="text-xs text-gray-400 mt-0.5">{header.pricePercent}% of total</p>
            </div>
          );
        })()}

        {/* Notes box */}
        <div className="md:col-span-3 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-800 mb-2">Notes</p>
          <div className="space-y-1.5 text-xs text-gray-600">
            <p>
              <span className="font-bold text-blue-600">Note 1:</span> The Consultant receives{' '}
              <span className="font-bold text-blue-600">60%</span> of the Price after submission of the first draft deliverable and{' '}
              <span className="font-bold text-emerald-600">40%</span> when the Service Manager accepts the final deliverable.
            </p>
            <p>
              <span className="font-bold text-amber-600">Note 2:</span> Payment distributed evenly monthly over the Works Contract period.
            </p>
            <p>
              <span className="text-gray-500">Note 3:</span> All percentages rounded to the nearest 1 decimal place.
            </p>
          </div>
        </div>
      </div>

      {/* Activity Tables by Group */}
      {groups.map(g => {
        const meta = GROUP_META[g];
        const header = groupHeader(g);
        const items = groupActivities(g);
        const Icon = meta.icon;
        const isExpanded = expandedGroups[g];

        return (
          <div key={g} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(g)}
              className={`w-full flex items-center justify-between px-5 py-3.5 ${meta.bg} border-b ${meta.border} hover:opacity-90 transition-opacity`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${meta.color}`} />
                <div className="text-left">
                  <span className={`font-bold text-sm ${meta.color}`}>
                    {header?.description || `Group ${g}`}
                  </span>
                  <span className="text-xs text-gray-500 ml-3">
                    {header?.pricePercent}% &middot; {fmtCurrency(header?.totalAmount || 0)} &middot; {items.length} items
                  </span>
                </div>
              </div>
              {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
            </button>

            {isExpanded && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">Item</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Draft Target</th>
                      <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Final Target</th>
                      <th className="text-right px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">%</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Total (HK$)</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-blue-500 uppercase tracking-wider w-32">60% Draft</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-emerald-500 uppercase tracking-wider w-32">40% Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const hasNote1 = item.note1 === true;
                      return (
                        <tr key={item.itemNo} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-25'}`}>
                          <td className="px-4 py-2.5">
                            <span className={`inline-flex items-center justify-center w-8 h-6 rounded text-xs font-bold ${meta.bg} ${meta.color} ${meta.border} border`}>
                              {item.itemNo}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-gray-800 font-medium text-xs">
                            {item.description}
                            {item.paymentNote && (
                              <span className="block text-[10px] text-amber-600 font-normal mt-0.5">{item.paymentNote}</span>
                            )}
                          </td>
                          <td className="text-center px-3 py-2.5 text-xs text-gray-500">{item.targetDraft}</td>
                          <td className="text-center px-3 py-2.5 text-xs text-gray-500">{item.targetFinal}</td>
                          <td className="text-right px-3 py-2.5 text-xs font-semibold text-gray-600">{item.pricePercent.toFixed(2)}%</td>
                          <td className="text-right px-4 py-2.5 text-xs font-bold text-gray-800">{fmtCurrency(item.totalAmount)}</td>
                          <td className="text-right px-4 py-2.5 text-xs font-semibold text-blue-600">
                            {hasNote1 ? fmtCurrency(item.draftMilestone) : '-'}
                          </td>
                          <td className="text-right px-4 py-2.5 text-xs font-semibold text-emerald-600">
                            {hasNote1 ? fmtCurrency(item.finalMilestone) : '-'}
                          </td>
                        </tr>
                      );
                    })}
                    {/* Group subtotal */}
                    <tr className={`${meta.bg} border-t-2 ${meta.border}`}>
                      <td colSpan={4} className={`px-4 py-2.5 text-xs font-bold ${meta.color} uppercase`}>Subtotal - Group {g}</td>
                      <td className={`text-right px-3 py-2.5 text-xs font-bold ${meta.color}`}>{header?.pricePercent.toFixed(2)}%</td>
                      <td className={`text-right px-4 py-2.5 text-xs font-bold ${meta.color}`}>{fmtCurrency(header?.totalAmount || 0)}</td>
                      <td className="text-right px-4 py-2.5 text-xs font-bold text-blue-600">
                        {fmtCurrency(items.filter(i => i.note1).reduce((sum, i) => sum + (i.draftMilestone || 0), 0))}
                      </td>
                      <td className="text-right px-4 py-2.5 text-xs font-bold text-emerald-600">
                        {fmtCurrency(items.filter(i => i.note1).reduce((sum, i) => sum + (i.finalMilestone || 0), 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      {/* Grand Total */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-5 shadow-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Grand Total</p>
            <p className="text-3xl font-bold mt-1">{fmtCurrency(schedule.tenderedTotal)}</p>
          </div>
          <div className="text-right space-y-1">
            {(() => {
              const note1Items = schedule.activities.filter(a => !a.isGroup && a.note1);
              const nonNote1Items = schedule.activities.filter(a => !a.isGroup && !a.note1 && !a.paymentNote);
              const monthlyItem = schedule.activities.find(a => a.paymentNote);
              return (
                <>
                  <div>
                    <span className="text-xs text-blue-300 mr-2">Note 1 - 60% Draft:</span>
                    <span className="text-sm font-bold text-blue-300">
                      {fmtCurrency(note1Items.reduce((sum, i) => sum + (i.draftMilestone || 0), 0))}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-emerald-300 mr-2">Note 1 - 40% Final:</span>
                    <span className="text-sm font-bold text-emerald-300">
                      {fmtCurrency(note1Items.reduce((sum, i) => sum + (i.finalMilestone || 0), 0))}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-300 mr-2">Other items (100%):</span>
                    <span className="text-sm font-bold text-gray-300">
                      {fmtCurrency(nonNote1Items.reduce((sum, i) => sum + (i.finalMilestone || i.totalAmount || 0), 0))}
                    </span>
                  </div>
                  {monthlyItem && (
                    <div>
                      <span className="text-xs text-amber-300 mr-2">Note 2 - Monthly:</span>
                      <span className="text-sm font-bold text-amber-300">{fmtCurrency(monthlyItem.totalAmount)}</span>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentScheduleComponent;
