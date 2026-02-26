import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { ArrowLeft, FileText, ChevronRight, DollarSign, Activity } from 'lucide-react';
import { ExpenditureItem } from '../types';

const ContractDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { state } = useAppContext();

    // Decode the URL parameter (e.g., 'GE/2024/04' might come in encoded)
    const decodedId = decodeURIComponent(id || '');

    const contract = state.contracts.find(c => c.contractNo === decodedId);
    const items = state.contractExpenditures.filter(e => e.contractId === decodedId);
    const giItems = state.giRequests.filter(g => g.contractId === decodedId);

    const totals = useMemo(() => {
        return items.reduce((acc, item) => ({
            approved: acc.approved + (item.approvedValue || 0),
            forecast: acc.forecast + (item.forecastValue || 0)
        }), { approved: 0, forecast: 0 });
    }, [items]);

    // Group items by Category
    const groupedItems = useMemo(() => {
        const groups: Record<string, typeof items> = {};
        items.forEach(item => {
            if (!groups[item.category]) groups[item.category] = [];
            groups[item.category].push(item);
        });
        return groups;
    }, [items]);

    if (!contract) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500">
                <FileText className="w-12 h-12 mb-4 text-gray-300" />
                <p className="text-lg font-medium">Contract Not Found</p>
                <button onClick={() => navigate('/contracts')} className="mt-4 text-emerald-600 hover:underline">
                    Return to Contracts
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
            {/* Header Container */}
            <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
                <button
                    onClick={() => navigate('/contracts')}
                    className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">{contract.contractNo}</h1>
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${contract.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                            contract.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-600'
                            }`}>
                            {contract.status}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{contract.title} • {contract.type}</p>
                </div>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <FileText className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-500">Approved Value</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">${totals.approved.toLocaleString()}</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Activity className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-500">Latest Forecast</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">${totals.forecast.toLocaleString()}</p>
                </div>

                <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-2xl p-6 shadow-sm border border-indigo-800 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-indigo-300" />
                        </div>
                        <h3 className="text-sm font-semibold text-indigo-200">Variance (Delta)</h3>
                    </div>
                    <p className="text-2xl font-bold text-white">
                        ${Math.abs(totals.forecast - totals.approved).toLocaleString()}
                    </p>
                    <p className="text-xs text-indigo-300 mt-1">
                        {totals.forecast > totals.approved ? 'Over Budget' : 'Under Budget'}
                    </p>
                </div>
            </div>

            {/* Expenditure Item Tables by Category */}
            <div className="space-y-8">
                {giItems.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 overflow-hidden">
                        <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-200 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wide">GI Request Quotas Pipeline</h3>
                            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold">
                                {giItems.length} Quotas
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white text-gray-500 text-xs border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold">Requirement Ref</th>
                                        <th className="px-6 py-3 font-semibold">Feature Type</th>
                                        <th className="px-6 py-3 font-semibold">Consultant</th>
                                        <th className="px-6 py-3 font-semibold text-right">TO Value</th>
                                        <th className="px-6 py-3 font-semibold text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {giItems.map((gi) => (
                                        <tr key={gi.id} className="hover:bg-emerald-50/30 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">
                                                {gi.featureRef}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${gi.featureType === 'Man-Made' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {gi.featureType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 font-medium">
                                                {gi.consultant}
                                            </td>
                                            <td className="px-6 py-4 text-right tabular-nums text-gray-900">
                                                {gi.toValue > 0 ? `$${gi.toValue.toLocaleString()}` : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${gi.status.toLowerCase().includes('completed') ? 'bg-emerald-100 text-emerald-700' :
                                                    gi.status.toLowerCase().includes('commenced') ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {gi.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {Object.keys(groupedItems).length === 0 && giItems.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                        <p className="text-gray-500">No expenditure records found for this contract.</p>
                    </div>
                ) : (
                    (Object.entries(groupedItems) as [string, ExpenditureItem[]][]).map(([category, categoryItems]) => (
                        <div key={category} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{category}</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-white text-gray-500 text-xs border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold">Requirement Ref</th>
                                            <th className="px-6 py-3 font-semibold">Description</th>
                                            <th className="px-6 py-3 font-semibold text-right">Approved Value</th>
                                            <th className="px-6 py-3 font-semibold text-right">Forecast Value</th>
                                            <th className="px-6 py-3 font-semibold text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {categoryItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                    {item.taskOrderNo}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 max-w-md truncate" title={item.description}>
                                                    {item.description || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-right tabular-nums">
                                                    ${item.approvedValue.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-right tabular-nums text-emerald-600 font-medium">
                                                    ${item.forecastValue.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${item.forecastValue > item.approvedValue ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {item.forecastValue > item.approvedValue ? 'Overrun' : 'On Track'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))
                )}
            </div>

        </div>
    );
};

export default ContractDetails;
