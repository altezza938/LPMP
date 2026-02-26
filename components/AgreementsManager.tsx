import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { Briefcase, ChevronRight, Plus, ExternalLink } from 'lucide-react';

const AgreementsManager: React.FC = () => {
    const { state } = useAppContext();
    const navigate = useNavigate();

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Agreements & Task Orders</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage consultancy agreements and their associated task orders.</p>
                </div>
            </div>

            <div className="grid gap-6">
                {state.agreements.map(agreement => {
                    const associatedTOs = state.taskOrders.filter(to => to.agreementId === agreement.id);

                    return (
                        <div key={agreement.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                                        <Briefcase className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">{agreement.name}</h2>
                                        <p className="text-sm text-gray-500">{agreement.description}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/agreements/${agreement.id}/task-orders`)}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    Manage TOs
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-5">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    Active Task Orders
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{associatedTOs.length}</span>
                                </h3>

                                {associatedTOs.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">No Task Orders issued under this agreement yet.</p>
                                ) : (
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {associatedTOs.map(to => {
                                            const featuresCount = state.features.filter(f => f.agreement === agreement.name && (f.taskOrderId === to.id || !f.taskOrderId)).length; // Temporary fallback tying features to TO
                                            return (
                                                <div key={to.id} className="p-4 border border-gray-100 rounded-lg bg-gray-50 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-bold text-emerald-700 text-sm">{to.toNo}</span>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${to.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                                                    to.status === 'Issued' ? 'bg-blue-100 text-blue-700' :
                                                                        'bg-amber-100 text-amber-700'
                                                                }`}>
                                                                {to.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{to.title}</p>
                                                    </div>

                                                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                                                        <span>{featuresCount} Features</span>
                                                        {to.dateIssued && <span>Issued: {to.dateIssued}</span>}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AgreementsManager;
