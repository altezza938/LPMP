import React, { useState, useMemo } from 'react';
import { PaymentSchedule as PaymentScheduleType, BillingMilestone, BillingRecord } from '../types';
import { useAppContext } from '../AppContext';
import { DollarSign, ChevronDown, ChevronRight, TrendingUp, FileText, Landmark, HardHat, CheckCircle2 } from 'lucide-react';

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

const fmtCurrency = (v: number | null | undefined) => {
  if (v === null || v === undefined) return '-';
  return `HK$${v.toLocaleString()}`;
};

const PaymentScheduleComponent: React.FC<PaymentScheduleProps> = ({ schedule, agreementName }) => {
  const { state, setBilling } = useAppContext();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ A: true, B: true, C: true, D: true });

  // Look up billing record for a specific milestone
  const findBilling = (itemNo: string, milestone: BillingMilestone): BillingRecord | undefined => {
    if (!schedule) return undefined;
    return (state.billingRecords ?? []).find(
      r => r.agreementId === schedule.agreementId && r.itemNo === itemNo && r.milestone === milestone
    );
  };

  // Total billed = sum of amounts for all existing billing records in this agreement
  const totalBilled = useMemo(() => {
    if (!schedule) return 0;
    const records = (state.billingRecords ?? []).filter(r => r.agreementId === schedule.agreementId);
    let sum = 0;
    for (const rec of records) {
      const item = schedule.activities.find(a => a.itemNo === rec.itemNo && !a.isGroup);
      if (!item) continue;
      if (rec.milestone === 'draft') sum += item.draftMilestone || 0;
      else if (rec.milestone === 'final') sum += item.finalMilestone || 0;
      else sum += item.totalAmount || 0;
    }
    return sum;
  }, [state.billingRecords, schedule]);

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

  const billedPercent = schedule.tenderedTotal > 0 ? (totalBilled / schedule.tenderedTotal) * 100 : 0;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
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

      {/* Group D summary card + Billed progress */}
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

        {/* Total Billed Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Total Billed</p>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{fmtCurrency(totalBilled)}</p>
          <div className="mt-2">
            <div className="h-1.5 bg-emerald-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(billedPercent, 100)}%` }} />
            </div>
            <p className="text-[10px] text-emerald-600 mt-1">{billedPercent.toFixed(1)}% of tendered total</p>
          </div>
        </div>

        {/* Notes box */}
        <div className="md:col-span-2 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-800 mb-2">Notes</p>
          <div className="space-y-1.5 text-xs text-gray-600">
            <p>
              <span className="font-bold text-blue-600">Note 1:</span> The Consultant receives{' '}
              <span className="font-bold text-blue-600">60%</span> after first draft and{' '}
              <span className="font-bold text-emerald-600">40%</span> after final acceptance.
            </p>
            <p>
              <span className="font-bold text-amber-600">Note 2:</span> Payment distributed evenly monthly over the Works Contract period.
            </p>
            <p>
              <span className="text-gray-500">Tick the checkbox beside each milestone once billed; enter the Invoice No. and PR No. to track billings.</span>
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

        // Compute group-level billed total
        const groupBilled = items.reduce((sum, item) => {
          if (item.note1) {
            const draftRec = findBilling(item.itemNo, 'draft');
            const finalRec = findBilling(item.itemNo, 'final');
            if (draftRec) sum += item.draftMilestone || 0;
            if (finalRec) sum += item.finalMilestone || 0;
          } else {
            const fullRec = findBilling(item.itemNo, 'full');
            if (fullRec) sum += item.totalAmount || 0;
          }
          return sum;
        }, 0);

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
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md">
                  Billed {fmtCurrency(groupBilled)}
                </span>
                {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
              </div>
            </button>

            {isExpanded && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-14">Item</th>
                      <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider min-w-[220px]">Description</th>
                      <th className="text-center px-2 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-20">Draft</th>
                      <th className="text-center px-2 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-20">Final</th>
                      <th className="text-right px-2 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-14">%</th>
                      <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-28">Total</th>
                      <th className="px-3 py-2.5 text-[10px] font-semibold text-blue-600 uppercase tracking-wider text-center" colSpan={2}>60% Draft Billing</th>
                      <th className="px-3 py-2.5 text-[10px] font-semibold text-emerald-600 uppercase tracking-wider text-center" colSpan={2}>40% Final Billing</th>
                    </tr>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th colSpan={6}></th>
                      <th className="text-right px-2 py-1 text-[9px] font-medium text-blue-500 w-28">Amount / PR#</th>
                      <th className="text-right px-2 py-1 text-[9px] font-medium text-blue-500 w-28">Invoice#</th>
                      <th className="text-right px-2 py-1 text-[9px] font-medium text-emerald-500 w-28">Amount / PR#</th>
                      <th className="text-right px-2 py-1 text-[9px] font-medium text-emerald-500 w-28">Invoice#</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const hasNote1 = item.note1 === true;
                      const fullRec = findBilling(item.itemNo, 'full');
                      const draftRec = findBilling(item.itemNo, 'draft');
                      const finalRec = findBilling(item.itemNo, 'final');

                      return (
                        <tr key={item.itemNo} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-25'}`}>
                          <td className="px-3 py-2">
                            <span className={`inline-flex items-center justify-center w-8 h-6 rounded text-xs font-bold ${meta.bg} ${meta.color} ${meta.border} border`}>
                              {item.itemNo}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-800 font-medium">
                            {item.description}
                            {item.paymentNote && (
                              <span className="block text-[10px] text-amber-600 font-normal mt-0.5">{item.paymentNote}</span>
                            )}
                          </td>
                          <td className="text-center px-2 py-2 text-[11px] text-gray-500">{item.targetDraft}</td>
                          <td className="text-center px-2 py-2 text-[11px] text-gray-500">{item.targetFinal}</td>
                          <td className="text-right px-2 py-2 text-[11px] font-semibold text-gray-600">{item.pricePercent.toFixed(2)}%</td>
                          <td className="text-right px-3 py-2 text-[11px] font-bold text-gray-800">{fmtCurrency(item.totalAmount)}</td>

                          {hasNote1 ? (
                            <>
                              {/* 60% Draft Billing */}
                              <td className="px-2 py-2">
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="checkbox"
                                    checked={!!draftRec}
                                    onChange={e => setBilling(schedule.agreementId, item.itemNo, 'draft', {
                                      billed: e.target.checked,
                                      invoiceNo: draftRec?.invoiceNo,
                                      prNo: draftRec?.prNo,
                                    })}
                                    className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-[11px] font-semibold text-blue-600 text-right">{fmtCurrency(item.draftMilestone)}</div>
                                    <input
                                      type="text"
                                      placeholder="PR#"
                                      value={draftRec?.prNo || ''}
                                      onChange={e => setBilling(schedule.agreementId, item.itemNo, 'draft', {
                                        billed: true,
                                        invoiceNo: draftRec?.invoiceNo,
                                        prNo: e.target.value,
                                      })}
                                      className="w-full text-right text-[10px] px-1 py-0.5 border border-gray-200 rounded focus:border-blue-400 focus:outline-none bg-white"
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="px-2 py-2">
                                <input
                                  type="text"
                                  placeholder="Invoice#"
                                  value={draftRec?.invoiceNo || ''}
                                  onChange={e => setBilling(schedule.agreementId, item.itemNo, 'draft', {
                                    billed: true,
                                    invoiceNo: e.target.value,
                                    prNo: draftRec?.prNo,
                                  })}
                                  className="w-full text-right text-[10px] px-1 py-1 border border-gray-200 rounded focus:border-blue-400 focus:outline-none bg-white"
                                />
                              </td>

                              {/* 40% Final Billing */}
                              <td className="px-2 py-2">
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="checkbox"
                                    checked={!!finalRec}
                                    onChange={e => setBilling(schedule.agreementId, item.itemNo, 'final', {
                                      billed: e.target.checked,
                                      invoiceNo: finalRec?.invoiceNo,
                                      prNo: finalRec?.prNo,
                                    })}
                                    className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-[11px] font-semibold text-emerald-600 text-right">{fmtCurrency(item.finalMilestone)}</div>
                                    <input
                                      type="text"
                                      placeholder="PR#"
                                      value={finalRec?.prNo || ''}
                                      onChange={e => setBilling(schedule.agreementId, item.itemNo, 'final', {
                                        billed: true,
                                        invoiceNo: finalRec?.invoiceNo,
                                        prNo: e.target.value,
                                      })}
                                      className="w-full text-right text-[10px] px-1 py-0.5 border border-gray-200 rounded focus:border-emerald-400 focus:outline-none bg-white"
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="px-2 py-2">
                                <input
                                  type="text"
                                  placeholder="Invoice#"
                                  value={finalRec?.invoiceNo || ''}
                                  onChange={e => setBilling(schedule.agreementId, item.itemNo, 'final', {
                                    billed: true,
                                    invoiceNo: e.target.value,
                                    prNo: finalRec?.prNo,
                                  })}
                                  className="w-full text-right text-[10px] px-1 py-1 border border-gray-200 rounded focus:border-emerald-400 focus:outline-none bg-white"
                                />
                              </td>
                            </>
                          ) : (
                            /* Non-note1: billing applies to full amount, span all 4 cols */
                            <td className="px-2 py-2" colSpan={4}>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={!!fullRec}
                                  onChange={e => setBilling(schedule.agreementId, item.itemNo, 'full', {
                                    billed: e.target.checked,
                                    invoiceNo: fullRec?.invoiceNo,
                                    prNo: fullRec?.prNo,
                                  })}
                                  className="w-3.5 h-3.5 accent-amber-600 cursor-pointer"
                                />
                                <span className="text-[11px] font-semibold text-amber-700 whitespace-nowrap">
                                  Full {fmtCurrency(item.totalAmount)}
                                </span>
                                <input
                                  type="text"
                                  placeholder="PR#"
                                  value={fullRec?.prNo || ''}
                                  onChange={e => setBilling(schedule.agreementId, item.itemNo, 'full', {
                                    billed: true,
                                    invoiceNo: fullRec?.invoiceNo,
                                    prNo: e.target.value,
                                  })}
                                  className="flex-1 text-[10px] px-1.5 py-1 border border-gray-200 rounded focus:border-amber-400 focus:outline-none bg-white min-w-0"
                                />
                                <input
                                  type="text"
                                  placeholder="Invoice#"
                                  value={fullRec?.invoiceNo || ''}
                                  onChange={e => setBilling(schedule.agreementId, item.itemNo, 'full', {
                                    billed: true,
                                    invoiceNo: e.target.value,
                                    prNo: fullRec?.prNo,
                                  })}
                                  className="flex-1 text-[10px] px-1.5 py-1 border border-gray-200 rounded focus:border-amber-400 focus:outline-none bg-white min-w-0"
                                />
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    {/* Group subtotal */}
                    <tr className={`${meta.bg} border-t-2 ${meta.border}`}>
                      <td colSpan={4} className={`px-3 py-2 text-[11px] font-bold ${meta.color} uppercase`}>Subtotal - Group {g}</td>
                      <td className={`text-right px-2 py-2 text-[11px] font-bold ${meta.color}`}>{header?.pricePercent.toFixed(2)}%</td>
                      <td className={`text-right px-3 py-2 text-[11px] font-bold ${meta.color}`}>{fmtCurrency(header?.totalAmount || 0)}</td>
                      <td colSpan={2} className="text-right px-2 py-2 text-[11px] font-bold text-blue-600">
                        Draft billed: {fmtCurrency(items.filter(i => i.note1 && findBilling(i.itemNo, 'draft')).reduce((s, i) => s + (i.draftMilestone || 0), 0))}
                      </td>
                      <td colSpan={2} className="text-right px-2 py-2 text-[11px] font-bold text-emerald-600">
                        Final billed: {fmtCurrency(
                          items.filter(i => i.note1 && findBilling(i.itemNo, 'final')).reduce((s, i) => s + (i.finalMilestone || 0), 0)
                          + items.filter(i => !i.note1 && findBilling(i.itemNo, 'full')).reduce((s, i) => s + (i.totalAmount || 0), 0)
                        )}
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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Grand Total</p>
            <p className="text-3xl font-bold mt-1">{fmtCurrency(schedule.tenderedTotal)}</p>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center gap-2 justify-end">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-300">Total Billed:</span>
              <span className="text-lg font-bold text-emerald-400">{fmtCurrency(totalBilled)}</span>
              <span className="text-xs text-slate-400">({billedPercent.toFixed(1)}%)</span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs text-slate-300">Outstanding:</span>
              <span className="text-sm font-semibold text-amber-300">{fmtCurrency(schedule.tenderedTotal - totalBilled)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentScheduleComponent;
