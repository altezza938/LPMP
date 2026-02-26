import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { FileSignature, Plus, Edit2, Trash2, ChevronRight } from 'lucide-react';
import { WorksContract } from '../types';
import { v4 as uuidv4 } from 'uuid';

const ContractMonitor: React.FC = () => {
    const { state, addContract, updateContract, deleteContract } = useAppContext();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<WorksContract>>({});

    const handleStartNew = () => {
        const newId = uuidv4();
        const newContract: WorksContract = {
            id: newId,
            agreementId: state.agreements[0]?.id || '',
            contractNo: `GE/202X/XX`,
            title: 'New Contract',
            type: 'LPMit',
            status: 'Pending'
        };
        addContract(newContract);
        handleEditStart(newContract);
    };

    const handleEditStart = (contract: WorksContract) => {
        setIsEditing(contract.id);
        setEditForm(contract);
    };

    const handleSave = () => {
        if (isEditing && editForm.id) {
            updateContract(editForm as WorksContract);
            setIsEditing(null);
        }
    };

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Works & GI Contracts</h1>
                    <p className="text-sm text-gray-500 mt-1">Monitor Ground Investigation and LPMit Works contracts.</p>
                </div>
                <button
                    onClick={handleStartNew}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Contract
                </button>
            </div>

            <div className="grid gap-6">
                {state.contracts.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                        No contracts added yet.
                    </div>
                ) : (
                    state.contracts.map(contract => {
                        const agreement = state.agreements.find(a => a.id === contract.agreementId);
                        const isCurrentEdit = isEditing === contract.id;

                        if (isCurrentEdit) {
                            return (
                                <div key={contract.id} className="bg-emerald-50/50 rounded-xl shadow-sm border border-emerald-200 p-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Agreement</label>
                                            <select value={editForm.agreementId || ''} onChange={e => setEditForm({ ...editForm, agreementId: e.target.value })} className="w-full border-gray-300 rounded text-sm px-2 py-1.5 focus:ring-emerald-500 focus:border-emerald-500">
                                                {state.agreements.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Contract No.</label>
                                            <input type="text" value={editForm.contractNo || ''} onChange={e => setEditForm({ ...editForm, contractNo: e.target.value })} className="w-full border-gray-300 rounded text-sm px-2 py-1.5 focus:ring-emerald-500 focus:border-emerald-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Title</label>
                                            <input type="text" value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="w-full border-gray-300 rounded text-sm px-2 py-1.5 focus:ring-emerald-500 focus:border-emerald-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Type</label>
                                            <select value={editForm.type || 'LPMit'} onChange={e => setEditForm({ ...editForm, type: e.target.value as any })} className="w-full border-gray-300 rounded text-sm px-2 py-1.5 focus:ring-emerald-500 focus:border-emerald-500">
                                                <option value="GI">GI (Ground Investigation)</option>
                                                <option value="LPMit">LPMit Works</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Status</label>
                                            <select value={editForm.status || 'Pending'} onChange={e => setEditForm({ ...editForm, status: e.target.value as any })} className="w-full border-gray-300 rounded text-sm px-2 py-1.5 focus:ring-emerald-500 focus:border-emerald-500">
                                                <option value="Pending">Pending</option>
                                                <option value="Active">Active</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-3 border-t border-emerald-100">
                                        <button onClick={() => setIsEditing(null)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded font-medium">Cancel</button>
                                        <button onClick={handleSave} className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded font-medium shadow-sm hover:bg-emerald-700">Save Contract</button>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={contract.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row items-stretch hover:shadow-md transition-shadow">
                                <div className="bg-gray-50 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-gray-100 min-w-[140px]">
                                    <div className="text-center">
                                        <FileSignature className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${contract.type === 'GI' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {contract.type} Contract
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                    {contract.contractNo}
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${contract.status === 'Active' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                                        contract.status === 'Completed' ? 'bg-gray-100 border-gray-200 text-gray-600' :
                                                            'bg-blue-50 border-blue-200 text-blue-700'
                                                        }`}>
                                                        {contract.status}
                                                    </span>
                                                </h2>
                                                <p className="text-sm text-gray-600 font-medium mt-1">{contract.title}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => handleEditStart(contract)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={() => { if (confirm('Delete contract?')) deleteContract(contract.id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                        <span className="flex items-center gap-1 font-medium">
                                            <span className="w-2 h-2 rounded-full bg-gray-300"></span> Under {agreement?.name || 'Unknown Agreement'}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            {contract.startDate && <span>Start: {contract.startDate}</span>}
                                            {contract.endDate && <span>End: {contract.endDate}</span>}
                                            <button
                                                onClick={() => navigate(`/contracts/${encodeURIComponent(contract.contractNo)}`)}
                                                className="ml-2 flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded transition-colors"
                                            >
                                                Details <ChevronRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ContractMonitor;
