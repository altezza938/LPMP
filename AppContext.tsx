import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProjectFeature, TaskOrder, Invoice, WorksContract, Agreement, FastTrackOpportunity, ExpenditureItem, GIRequestLimit, UserCredentials } from './types';
import { MOCK_DATA, AGREEMENTS, MOCK_INVOICES, FAST_TRACK_OPPORTUNITIES, CONTRACT_EXPENDITURES, GI_REQUEST_QUOTAS } from './constants';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
    activeAgreementId: string | null;
    agreements: Agreement[];
    features: ProjectFeature[];
    taskOrders: TaskOrder[];
    invoices: Invoice[];
    contracts: WorksContract[];
    fastTrackOpportunities: FastTrackOpportunity[];
    contractExpenditures: ExpenditureItem[];
    giRequests: GIRequestLimit[];
    credentials?: UserCredentials;
    columnOrder?: string[];
}

interface AppContextType {
    state: AppState;
    setActiveAgreementId: (id: string | null) => void;
    // History
    undoStack: ProjectFeature[][];
    redoStack: ProjectFeature[][];
    undo: () => void;
    redo: () => void;
    pushHistory: () => void;
    updateColumnOrder: (order: string[]) => void;
    // Features
    updateFeature: (feature: ProjectFeature) => void;
    addFeature: (feature: ProjectFeature) => void;
    deleteFeature: (id: string) => void;
    reorderFeatures: (orderedFeatures: ProjectFeature[]) => void;
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
    updateCredentials: (creds: UserCredentials) => void;
    exportData: () => void;
    importData: (jsonData: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'lpmit-toms-v2-data';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AppState>(() => {
        const defaultCols = ['featureNo', 's3r', 'stla', 'access', 'engPlan', 'tprp', 'hssp', 'actions'];

        const defaultTaskOrders: TaskOrder[] = [
            { id: uuidv4(), agreementId: 'ce47-2022-ge', toNo: 'TO-01', title: 'Batch 1 LPMit Works', status: 'Issued', dateIssued: '2024-01-15' },
            { id: uuidv4(), agreementId: 'ce53-2022-ge', toNo: 'MS-01', title: 'Submission of final Stage 2(H) Report (One Study Area)', status: 'Draft', expectedCompletion: '2026-12-10', remarks: 'Revised Key Date' },
            { id: uuidv4(), agreementId: 'ce53-2022-ge', toNo: 'MS-02', title: 'Submission of final Stage 2(H) Report (All Study Areas)', status: 'Draft', expectedCompletion: '2027-01-09', remarks: 'Revised Key Date' },
            { id: uuidv4(), agreementId: 'ce53-2022-ge', toNo: 'MS-03', title: 'Submission of final Stage 3(H) Report (Part 1)', status: 'Draft', expectedCompletion: '2027-09-10', remarks: 'Revised Key Date' },
            { id: uuidv4(), agreementId: 'ce53-2022-ge', toNo: 'MS-04', title: 'Submission of final Stage 3(H) Report (Part 2)', status: 'Draft', expectedCompletion: '2027-10-09', remarks: 'Revised Key Date' }
        ];

        const defaultContracts: WorksContract[] = [
            { id: uuidv4(), agreementId: 'ce47-2022-ge', contractNo: 'GE/2024/07', title: 'GI works for Batch 1', type: 'GI', status: 'Active' },
            { id: uuidv4(), agreementId: 'ce47-2022-ge', contractNo: 'GE/2024/04', title: 'LPMit Works Contract', type: 'LPMit', status: 'Active' },
            { id: uuidv4(), agreementId: 'ce53-2022-ge', contractNo: 'GE/2025/10', title: 'LPMit Works Contract', type: 'LPMit', status: 'Pending' }
        ];

        const freshState: AppState = {
            activeAgreementId: AGREEMENTS[0]?.id || null,
            agreements: AGREEMENTS,
            features: MOCK_DATA,
            taskOrders: defaultTaskOrders,
            invoices: MOCK_INVOICES,
            contracts: defaultContracts,
            fastTrackOpportunities: FAST_TRACK_OPPORTUNITIES,
            contractExpenditures: CONTRACT_EXPENDITURES,
            giRequests: GI_REQUEST_QUOTAS,
            credentials: { username: 'admin', passwordHash: '123' },
            columnOrder: defaultCols
        };

        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as Partial<AppState>;
                // Fill in any missing top-level arrays/fields from fresh defaults so
                // older persisted state doesn't crash components that iterate them.
                const merged: AppState = {
                    ...freshState,
                    ...parsed,
                    agreements: parsed.agreements ?? freshState.agreements,
                    features: parsed.features ?? freshState.features,
                    taskOrders: parsed.taskOrders ?? freshState.taskOrders,
                    invoices: parsed.invoices ?? freshState.invoices,
                    contracts: parsed.contracts ?? freshState.contracts,
                    fastTrackOpportunities: parsed.fastTrackOpportunities ?? freshState.fastTrackOpportunities,
                    contractExpenditures: parsed.contractExpenditures ?? freshState.contractExpenditures,
                    giRequests: parsed.giRequests ?? freshState.giRequests,
                    columnOrder: parsed.columnOrder ?? freshState.columnOrder,
                };
                // Merge any missing agreements from constants
                const storedAgreementIds = new Set(merged.agreements.map(a => a.id));
                for (const ag of AGREEMENTS) {
                    if (!storedAgreementIds.has(ag.id)) {
                        merged.agreements.push(ag);
                    }
                }
                // Merge any missing features from constants
                const storedFeatureIds = new Set(merged.features.map(f => f.id));
                for (const feat of MOCK_DATA) {
                    if (!storedFeatureIds.has(feat.id)) {
                        merged.features.push(feat);
                    }
                }
                return merged;
            }
        } catch (e) {
            console.error("Failed to parse stored state", e);
        }

        return freshState;
    });

    const [undoStack, setUndoStack] = useState<ProjectFeature[][]>([]);
    const [redoStack, setRedoStack] = useState<ProjectFeature[][]>([]);

    useEffect(() => {
        if (state) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
    }, [state]);

    const pushHistory = () => {
        setUndoStack(prev => [...prev, state.features]);
        setRedoStack([]); // clear redo stack on new action
    };

    const undo = () => {
        if (undoStack.length === 0) return;
        const prevFeatures = undoStack[undoStack.length - 1];

        setRedoStack(prev => [...prev, state.features]);
        setUndoStack(prev => prev.slice(0, prev.length - 1));

        setState(prev => ({ ...prev, features: prevFeatures }));
    };

    const redo = () => {
        if (redoStack.length === 0) return;
        const nextFeatures = redoStack[redoStack.length - 1];

        setUndoStack(prev => [...prev, state.features]);
        setRedoStack(prev => prev.slice(0, prev.length - 1));

        setState(prev => ({ ...prev, features: nextFeatures }));
    };

    const updateColumnOrder = (order: string[]) => {
        setState(prev => ({ ...prev, columnOrder: order }));
    };

    const setActiveAgreementId = (id: string | null) => {
        setState(prev => ({ ...prev, activeAgreementId: id }));
    };

    const updateFeature = (feature: ProjectFeature) => {
        setState(prev => ({ ...prev, features: prev.features.map(f => f.id === feature.id ? feature : f) }));
    };
    const addFeature = (feature: ProjectFeature) => {
        setState(prev => ({ ...prev, features: [...prev.features, feature] }));
    };
    const deleteFeature = (id: string) => {
        setState(prev => ({ ...prev, features: prev.features.filter(f => f.id !== id) }));
    };

    const reorderFeatures = (orderedFeatures: ProjectFeature[]) => {
        setState(prev => {
            // Re-assign the 'no' property based on the new array order
            const renumbered = orderedFeatures.map((f, i) => ({ ...f, no: i + 1 }));
            
            // To be safe, if orderedFeatures doesn't contain all features (e.g. filtered), 
            // we should only update the ones that were reordered. But in our case, 
            // orderedData in ProjectList is usually all features of the current view.
            // If the user is viewing a filtered list and re-orders, updating 'no' simply from 1 to N 
            // of the filtered list might overwrite absolute rankings if not careful.
            // Let's assume all features for the agreement are being re-ordered.
            
            // If we only reorder the active agreement's features:
            const activeAgreementFeatures = renumbered;
            const otherAgreementFeatures = prev.features.filter(f => 
              !activeAgreementFeatures.find(af => af.id === f.id)
            );

            return {
              ...prev,
              features: [...activeAgreementFeatures, ...otherAgreementFeatures].sort((a,b) => a.no - b.no)
            };
        });
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

    const updateCredentials = (creds: UserCredentials) => {
        setState(prev => ({ ...prev, credentials: creds }));
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
            setActiveAgreementId,
            undoStack, redoStack, undo, redo, pushHistory, updateColumnOrder,
            updateFeature, addFeature, deleteFeature, reorderFeatures,
            updateTaskOrder, addTaskOrder, deleteTaskOrder,
            updateInvoice, addInvoice, deleteInvoice,
            updateContract, addContract, deleteContract,
            updateCredentials,
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
