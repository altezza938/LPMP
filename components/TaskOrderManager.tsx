import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { ArrowLeft, Plus, Edit2, Trash2, MapPin } from 'lucide-react';
import { TaskOrder } from '../types';
import { v4 as uuidv4 } from 'uuid';

const TaskOrderManager: React.FC = () => {
    const { id: agreementId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { state, addTaskOrder, updateTaskOrder, deleteTaskOrder } = useAppContext();

    const agreement = state.agreements.find(a => a.id === agreementId);
    const taskOrders = state.taskOrders.filter(to => to.agreementId === agreementId);

    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<TaskOrder>>({});

    if (!agreement) {
        return (
            <div className="p-6">
                <button onClick={() => navigate('/agreements')} className="flex items-center text-emerald-600 mb-4 hover:underline">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Agreements
                </button>
                <p>Agreement not found.</p>
            </div>
        );
    }

    const handleStartNew = () => {
        const newId = uuidv4();
        const newTO: TaskOrder = {
            id: newId,
            agreementId: agreement.id,
            toNo: `TO-${taskOrders.length + 1}`,
            title: 'New Task Order',
            status: 'Draft',
        };
        addTaskOrder(newTO);
        handleEditStart(newTO);
    };

    const handleEditStart = (to: TaskOrder) => {
        setIsEditing(to.id);
        setEditForm(to);
    };

    const handleSave = () => {
        if (isEditing && editForm.id) {
            updateTaskOrder(editForm as TaskOrder);
            setIsEditing(null);
        }
    };

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <button onClick={() => navigate('/agreements')} className="flex items-center text-emerald-600 text-sm mb-4 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-emerald-100 hover:bg-emerald-50 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Agreements
            </button>

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{agreement.name} - Task Orders</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage features and status for task orders under this agreement.</p>
                </div>
                <button
                    onClick={handleStartNew}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Create Task Order
                </button>
            </div>

            <div className="space-y-4">
                {taskOrders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                        <p className="text-gray-500">No Task Orders exist for this agreement.</p>
                    </div>
                ) : (
                    taskOrders.map(to => {
                        const isCurrentEdit = isEditing === to.id;
                        const features = state.features.filter(f => f.taskOrderId === to.id || (!f.taskOrderId && f.agreement === agreement.name)); // Temporary loose coupling fallback

                        return (
                            <div key={to.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                {isCurrentEdit ? (
                                    <div className="p-5 bg-emerald-50/50 border-b border-emerald-100">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">TO Number</label>
                                                <input
                                                    type="text"
                                                    value={editForm.toNo || ''}
                                                    onChange={e => setEditForm({ ...editForm, toNo: e.target.value })}
                                                    className="w-full border-gray-300 rounded-lg text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Status</label>
                                                <select
                                                    value={editForm.status || 'Draft'}
                                                    onChange={e => setEditForm({ ...editForm, status: e.target.value as any })}
                                                    className="w-full border-gray-300 rounded-lg text-sm"
                                                >
                                                    <option value="Draft">Draft</option>
                                                    <option value="Issued">Issued</option>
                                                    <option value="Completed">Completed</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Title</label>
                                                <input
                                                    type="text"
                                                    value={editForm.title || ''}
                                                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                                    className="w-full border-gray-300 rounded-lg text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Date Issued</label>
                                                <input
                                                    type="date"
                                                    value={editForm.dateIssued || ''}
                                                    onChange={e => setEditForm({ ...editForm, dateIssued: e.target.value })}
                                                    className="w-full border-gray-300 rounded-lg text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Expected Completion</label>
                                                <input
                                                    type="date"
                                                    value={editForm.expectedCompletion || ''}
                                                    onChange={e => setEditForm({ ...editForm, expectedCompletion: e.target.value })}
                                                    className="w-full border-gray-300 rounded-lg text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <button onClick={() => setIsEditing(null)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                            <button onClick={handleSave} className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded shadow-sm hover:bg-emerald-700">Save Changes</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h2 className="text-lg font-bold text-gray-900">{to.toNo}</h2>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${to.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                                        to.status === 'Issued' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {to.status}
                                                </span>
                                            </div>
                                            <p className="text-base text-gray-700 mb-2">{to.title}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                {to.dateIssued && <span>Issued: {to.dateIssued}</span>}
                                                {to.expectedCompletion && <span className="flex items-center"><ArrowLeft className="w-3 h-3 mr-1 inline transform min-w-[max-content] scale-x-[-1]" /> Expected: {to.expectedCompletion}</span>}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEditStart(to)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded bg-gray-50 border border-gray-100 transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => { if (confirm('Delete Task Order?')) deleteTaskOrder(to.id); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded bg-gray-50 border border-gray-100 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="p-5 border-t border-gray-100 bg-gray-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-gray-700">Associated Features ({features.length}/16)</h3>
                                        <button className="text-xs text-emerald-600 font-medium flex items-center hover:underline">
                                            <Plus className="w-3 h-3 mr-1" /> Add Feature
                                        </button>
                                    </div>

                                    {features.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {features.map(f => (
                                                <div key={f.id} className="bg-white border border-gray-200 rounded p-3 flex items-start gap-3">
                                                    <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-gray-900 truncate">{f.featureNo}</p>
                                                        <p className="text-[10px] text-gray-500 truncate" title={f.location}>{f.location}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400">No features assigned to this task order yet.</p>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default TaskOrderManager;
