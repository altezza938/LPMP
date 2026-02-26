import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import { FileText, Plus, Edit2, Trash2, DollarSign, CheckCircle, Briefcase } from 'lucide-react';
import { Invoice } from '../types';
import { v4 as uuidv4 } from 'uuid';

const InvoiceTracker: React.FC = () => {
    const { state, addInvoice, updateInvoice, deleteInvoice } = useAppContext();
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Invoice>>({});

    const handleStartNew = () => {
        const newId = uuidv4();
        const newInvoice: Invoice = {
            id: newId,
            agreementId: state.agreements[0]?.id || '',
            invoiceNo: `INV-${state.invoices.length + 1}`,
            amount: 0,
            status: 'Pending',
            dateSubmitted: new Date().toISOString().split('T')[0]
        };
        addInvoice(newInvoice);
        handleEditStart(newInvoice);
    };

    const handleEditStart = (invoice: Invoice) => {
        setIsEditing(invoice.id);
        setEditForm(invoice);
    };

    const handleSave = () => {
        if (isEditing && editForm.id) {
            updateInvoice(editForm as Invoice);
            setIsEditing(null);
        }
    };

    const calculateTotalBilled = (agreementId: string) => {
        return state.invoices
            .filter(i => i.agreementId === agreementId && i.status === 'Paid')
            .reduce((sum, i) => sum + Number(i.amount), 0);
    };

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Invoices & Payments</h1>
                    <p className="text-sm text-gray-500 mt-1">Track consultancy invoices against TO completion milestones.</p>
                </div>
                <button
                    onClick={handleStartNew}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Log Invoice
                </button>
            </div>

            {state.agreements.map(agreement => (
                <div key={agreement.id} className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <BriefcaseIcon /> {agreement.name}
                        </h2>
                        <span className="text-sm font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                            Total Paid: ${calculateTotalBilled(agreement.id).toLocaleString()}
                        </span>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold">
                                    <tr>
                                        <th className="px-4 py-3">Invoice No.</th>
                                        <th className="px-4 py-3">Linked Task Orders</th>
                                        <th className="px-4 py-3">Date Submitted</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {state.invoices.filter(i => i.agreementId === agreement.id).length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-gray-400 italic">No invoices recorded for this agreement.</td>
                                        </tr>
                                    ) : (
                                        state.invoices.filter(i => i.agreementId === agreement.id).map(invoice => {
                                            const isCurrentEdit = isEditing === invoice.id;

                                            if (isCurrentEdit) {
                                                return (
                                                    <tr key={invoice.id} className="bg-blue-50/30">
                                                        <td className="px-4 py-3">
                                                            <input type="text" value={editForm.invoiceNo || ''} onChange={e => setEditForm({ ...editForm, invoiceNo: e.target.value })} className="w-full border-gray-300 rounded text-sm px-2 py-1" />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <select multiple value={editForm.linkedTaskOrders || []} onChange={e => {
                                                                const selected = Array.from(e.target.selectedOptions, option => option.value);
                                                                setEditForm({ ...editForm, linkedTaskOrders: selected });
                                                            }} className="w-full border-gray-300 rounded text-xs px-2 py-1 h-16">
                                                                {state.taskOrders.filter(t => t.agreementId === agreement.id).map(t => (
                                                                    <option key={t.id} value={t.id}>{t.toNo}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input type="date" value={editForm.dateSubmitted || ''} onChange={e => setEditForm({ ...editForm, dateSubmitted: e.target.value })} className="w-full border-gray-300 rounded text-sm px-2 py-1" />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input type="number" value={editForm.amount || 0} onChange={e => setEditForm({ ...editForm, amount: Number(e.target.value) })} className="w-full border-gray-300 rounded text-sm px-2 py-1" />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <select value={editForm.status || 'Pending'} onChange={e => setEditForm({ ...editForm, status: e.target.value as any })} className="border-gray-300 rounded text-sm px-2 py-1">
                                                                <option value="Pending">Pending</option>
                                                                <option value="Paid">Paid</option>
                                                                <option value="Rejected">Rejected</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <button onClick={handleSave} className="text-emerald-600 hover:text-emerald-800 text-xs font-medium bg-emerald-50 px-2 py-1 rounded mr-2">Save</button>
                                                            <button onClick={() => setIsEditing(null)} className="text-gray-500 hover:text-gray-700 text-xs font-medium">Cancel</button>
                                                        </td>
                                                    </tr>
                                                );
                                            }

                                            return (
                                                <tr key={invoice.id} className="hover:bg-gray-50/50">
                                                    <td className="px-4 py-3 font-medium text-gray-900 border-l-2 border-transparent">
                                                        {invoice.invoiceNo}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600 text-xs">
                                                        {invoice.linkedTaskOrders && invoice.linkedTaskOrders.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {invoice.linkedTaskOrders.map(toId => {
                                                                    const toObj = state.taskOrders.find(t => t.id === toId);
                                                                    return toObj ? <span key={toId} className="bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">{toObj.toNo}</span> : null;
                                                                })}
                                                            </div>
                                                        ) : <span className="text-gray-400 italic">None</span>}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600">{invoice.dateSubmitted}</td>
                                                    <td className="px-4 py-3 font-bold text-gray-700">${Number(invoice.amount).toLocaleString()}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                                                            invoice.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-red-100 text-red-700'
                                                            }`}>
                                                            {invoice.status === 'Paid' && <CheckCircle className="w-3 h-3" />}
                                                            {invoice.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button onClick={() => handleEditStart(invoice)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                                        <button onClick={() => { if (confirm('Delete invoice?')) deleteInvoice(invoice.id); }} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors ml-1"><Trash2 className="w-4 h-4" /></button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const BriefcaseIcon = () => <Briefcase className="w-5 h-5 text-emerald-600" />;

export default InvoiceTracker;
