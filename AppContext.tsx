import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProjectFeature, TaskOrder, Invoice, WorksContract, Agreement } from './types';
import { MOCK_DATA, AGREEMENTS } from './constants';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
    agreements: Agreement[];
    features: ProjectFeature[];
    taskOrders: TaskOrder[];
    invoices: Invoice[];
    contracts: WorksContract[];
}

interface AppContextType {
    state: AppState;
    // Features
    updateFeature: (feature: ProjectFeature) => void;
    addFeature: (feature: ProjectFeature) => void;
    deleteFeature: (id: string) => void;
    // Task Orders
    updateTaskOrder: (to: TaskOrder) => void;
    addTaskOrder: (to: TaskOrder) => void;
    deleteTaskOrder: (id: string) => void;
    // Invoices
    updateInvoice: (invoice: Invoice) => void;
    addInvoice: (invoice: Invoice) => void;
    deleteInvoice: (id: string) => void;
    // Contracts
    updateContract: (contract: WorksContract) => void;
    addContract: (contract: WorksContract) => void;
    deleteContract: (id: string) => void;

    exportData: () => void;
    importData: (jsonData: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'lpmit-toms-v2-data';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AppState>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error("Failed to parse stored state", e);
        }

        // Default initial state
        return {
            agreements: [
                ...AGREEMENTS,
                { id: 'ce53-2022-ge', name: 'CE 53/2022 (GE)', description: 'LPMit Programme - Landslip Prevention and Mitigation Works' }
            ],
            features: MOCK_DATA,
            taskOrders: [
                { id: uuidv4(), agreementId: 'ce47-2022-ge', toNo: 'TO-01', title: 'Batch 1 LPMit Works', status: 'Issued', dateIssued: '2024-01-15' }
            ],
            invoices: [],
            contracts: [
                { id: uuidv4(), agreementId: 'ce47-2022-ge', contractNo: 'GE/2024/07', title: 'GI works for Batch 1', type: 'GI', status: 'Active' },
                { id: uuidv4(), agreementId: 'ce47-2022-ge', contractNo: 'GE/2024/04', title: 'LPMit Works Contract', type: 'LPMit', status: 'Active' },
                { id: uuidv4(), agreementId: 'ce53-2022-ge', contractNo: 'GE/2025/10', title: 'LPMit Works Contract', type: 'LPMit', status: 'Pending' }
            ]
        };
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    const updateFeature = (feature: ProjectFeature) => {
        setState(prev => ({ ...prev, features: prev.features.map(f => f.id === feature.id ? feature : f) }));
    };
    const addFeature = (feature: ProjectFeature) => {
        setState(prev => ({ ...prev, features: [...prev.features, feature] }));
    };
    const deleteFeature = (id: string) => {
        setState(prev => ({ ...prev, features: prev.features.filter(f => f.id !== id) }));
    };

    const updateTaskOrder = (to: TaskOrder) => {
        setState(prev => ({ ...prev, taskOrders: prev.taskOrders.map(t => t.id === to.id ? to : t) }));
    };
    const addTaskOrder = (to: TaskOrder) => {
        setState(prev => ({ ...prev, taskOrders: [...prev.taskOrders, to] }));
    };
    const deleteTaskOrder = (id: string) => {
        setState(prev => ({ ...prev, taskOrders: prev.taskOrders.filter(t => t.id !== id) }));
    };

    const updateInvoice = (inv: Invoice) => {
        setState(prev => ({ ...prev, invoices: prev.invoices.map(i => i.id === inv.id ? inv : i) }));
    };
    const addInvoice = (inv: Invoice) => {
        setState(prev => ({ ...prev, invoices: [...prev.invoices, inv] }));
    };
    const deleteInvoice = (id: string) => {
        setState(prev => ({ ...prev, invoices: prev.invoices.filter(i => i.id !== id) }));
    };

    const updateContract = (contract: WorksContract) => {
        setState(prev => ({ ...prev, contracts: prev.contracts.map(c => c.id === contract.id ? contract : c) }));
    };
    const addContract = (contract: WorksContract) => {
        setState(prev => ({ ...prev, contracts: [...prev.contracts, contract] }));
    };
    const deleteContract = (id: string) => {
        setState(prev => ({ ...prev, contracts: prev.contracts.filter(c => c.id !== id) }));
    };

    const exportData = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "lpmit-toms-backup.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const importData = (jsonData: string) => {
        try {
            const parsed = JSON.parse(jsonData);
            if (parsed && parsed.agreements && parsed.features) {
                setState(parsed);
            } else {
                alert("Invalid backup file format.");
            }
        } catch (e) {
            alert("Error parsing backup string.");
        }
    };

    return (
        <AppContext.Provider value={{
            state,
            updateFeature, addFeature, deleteFeature,
            updateTaskOrder, addTaskOrder, deleteTaskOrder,
            updateInvoice, addInvoice, deleteInvoice,
            updateContract, addContract, deleteContract,
            exportData, importData
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
