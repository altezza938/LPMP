import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectMap from './components/ProjectMap';
import ProjectTimeline from './components/ProjectTimeline';
import LoginScreen from './components/LoginScreen';
import AgreementsManager from './components/AgreementsManager';
import TaskOrderManager from './components/TaskOrderManager';
import InvoiceTracker from './components/InvoiceTracker';
import ContractMonitor from './components/ContractMonitor';
import ContractDetails from './components/ContractDetails';
import Settings from './components/Settings';
import FeatureEditor from './components/FeatureEditor';
import PaymentScheduleComponent from './components/PaymentSchedule';
import { useAppContext } from './AppContext';
import { PAYMENT_SCHEDULES } from './constants';
import { LayoutDashboard, Mountain, Bell, ChevronDown, Map as MapIcon, CalendarRange, Table2, Menu, X, LogOut, CheckSquare, Briefcase, FileText, FileSignature, Settings as SettingsIcon, DollarSign } from 'lucide-react';

const MainLayout: React.FC<{ currentUser: string | null; handleLogout: () => void }> = ({ currentUser, handleLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { state, setActiveAgreementId, updateFeature, exportData, importData } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleToggleAccepted = (id: string) => {
    const feature = state.features.find(f => f.id === id);
    if (!feature) return;

    if (feature.accepted) {
      updateFeature({ ...feature, accepted: false, acceptedDate: undefined, acceptedBy: undefined });
    } else {
      const now = new Date();
      updateFeature({
        ...feature,
        accepted: true,
        acceptedDate: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        acceptedBy: currentUser || 'Unknown',
      });
    }
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/agreements', icon: Briefcase, label: 'Agreements & TOs' },
    { path: '/map', icon: MapIcon, label: 'Map & Tasks' },
    { path: '/table', icon: Table2, label: 'Summary Table' },
    { path: '/timeline', icon: CalendarRange, label: 'Timeline' },
    { path: '/invoices', icon: FileText, label: 'Invoices & Payments' },
    { path: '/payment-schedule', icon: DollarSign, label: 'Payment Schedule' },
    { path: '/contracts', icon: FileSignature, label: 'Works & GI Contracts' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' }
  ];

  const currentNav = navItems.find(item => location.pathname.startsWith(item.path));
  const viewTitle = currentNav ? currentNav.label : 'Project Overview';

  const activeAgreement = state.agreements.find(a => a.id === state.activeAgreementId);
  const filteredTaskOrders = state.taskOrders.filter(to => to.agreementId === state.activeAgreementId);
  const filteredFeatures = state.features.filter(f => {
    // If it has a taskOrderId, check if that TO belongs to this agreement
    if (f.taskOrderId) {
      return filteredTaskOrders.some(to => to.id === f.taskOrderId);
    }
    // Otherwise fallback to checking the agreement name string (legacy loose coupling)
    return activeAgreement ? f.agreement === activeAgreement.name : true;
  });

  const acceptedCount = filteredFeatures.filter(p => p.accepted).length;

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex">
      {/* Sidebar Navigation */}
      <aside className={`
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        fixed md:static inset-y-0 left-0 z-50
        w-[260px] bg-gradient-to-b from-[#0f172a] to-[#1a2744] text-white flex-shrink-0 flex flex-col
        transition-transform duration-300 ease-in-out shadow-2xl
      `}>
        <div className="p-5 border-b border-white/10 flex items-center gap-3 space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
            <Mountain className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-base tracking-tight truncate">LPMit TOMS</h1>
            <p className="text-[10px] text-emerald-300/70 leading-tight">Expanded Management</p>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden ml-auto p-1 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Agreement Badge */}
        <div className="px-4 pt-4 pb-2">
          <div className="bg-gradient-to-r from-emerald-900/60 to-emerald-800/40 border border-emerald-600/30 rounded-xl px-3.5 py-2.5 backdrop-blur-sm">
            <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider mb-1">Active Agreement</p>
            <select
              className="w-full bg-emerald-950/50 border border-emerald-700/50 text-white text-sm font-bold rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              value={state.activeAgreementId || ''}
              onChange={(e) => setActiveAgreementId(e.target.value)}
            >
              {state.agreements.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Acceptance Counter */}
        <div className="px-4 pt-2 pb-2">
          <div className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <p className="text-xs text-gray-300 font-medium">Features Accepted</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-white">{acceptedCount}</span>
                <span className="text-xs text-gray-500">/ {filteredFeatures.length}</span>
              </div>
            </div>
            <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${filteredFeatures.length > 0 ? (acceptedCount / filteredFeatures.length) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 pt-3 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-3 pb-2 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Navigation</p>
          {navItems.map(({ path, icon: Icon, label }) => (
            <button
              key={path}
              onClick={() => {
                navigate(path);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${location.pathname.startsWith(path)
                ? 'bg-emerald-500/20 text-emerald-300 shadow-lg shadow-emerald-900/10 border border-emerald-500/30'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent'
                }`}
            >
              <Icon className={`w-[18px] h-[18px] ${location.pathname.startsWith(path) ? 'text-emerald-400' : ''}`} />
              <span className="font-medium text-sm">{label}</span>
            </button>
          ))}

          <div className="mt-6 px-3">
            <p className="pb-2 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Data Management</p>
            <button
              onClick={exportData}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-all duration-200 text-sm"
            >
              Export Backup
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="px-3 py-2 text-[11px] text-gray-500">
            <p className="font-medium text-gray-400">LPMit Programme</p>
            <p className="text-gray-600 mt-0.5">CEDD / GEO / LPM</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-gray-200/80 flex items-center justify-between px-4 md:px-6 shadow-sm z-20 no-print">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-gray-900">
              {viewTitle}
            </h2>
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {filteredFeatures.length} Features
            </span>
            {acceptedCount > 0 && (
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {acceptedCount} Accepted
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button className="relative text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {(currentUser || 'U')[0].toUpperCase()}
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-semibold text-gray-800 text-xs leading-tight">{currentUser}</p>
                <p className="text-[10px] text-gray-400">Project Manager</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 cursor-pointer" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto bg-[#f1f5f9]">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/dashboard" element={
              <div className="p-4 md:p-6 max-w-7xl mx-auto">
                <Dashboard data={filteredFeatures} onFeatureSelect={(id) => navigate('/table')} />
              </div>
            } />

            <Route path="/agreements" element={<AgreementsManager />} />
            <Route path="/agreements/:id/task-orders" element={<TaskOrderManager />} />

            <Route path="/invoices" element={<InvoiceTracker />} />
            <Route path="/payment-schedule" element={
              <div className="p-4 md:p-6">
                <PaymentScheduleComponent
                  schedule={PAYMENT_SCHEDULES.find(ps => ps.agreementId === state.activeAgreementId)}
                  agreementName={activeAgreement?.name || ''}
                />
              </div>
            } />
            <Route path="/contracts" element={<ContractMonitor />} />

            <Route path="/map" element={
              <div className="flex flex-col h-full">
                <div className="h-1/3 min-h-[280px] w-full border-b border-gray-200 shadow-sm relative z-0">
                  <ProjectMap
                    data={filteredFeatures}
                    selectedId={null}
                    onSelectFeature={() => { }}
                  />
                </div>
                <div className="flex-1 overflow-hidden p-4 md:p-6 bg-[#f1f5f9]">
                  <ProjectList
                    data={filteredFeatures}
                    selectedId={null}
                    onSelectFeature={() => { }}
                    onUpdateFeature={updateFeature}
                    onToggleAccepted={handleToggleAccepted}
                  />
                </div>
              </div>
            } />

            <Route path="/table" element={
              <div className="p-4 md:p-6 h-full">
                <ProjectList
                  data={filteredFeatures}
                  selectedId={null}
                  onSelectFeature={() => { }}
                  onUpdateFeature={updateFeature}
                  onToggleAccepted={handleToggleAccepted}
                  fullTable
                />
              </div>
            } />

            <Route path="/timeline" element={
              <div className="p-4 md:p-6 h-full">
                <ProjectTimeline
                  data={filteredFeatures}
                  selectedId={null}
                  onSelectProject={() => { }}
                />
              </div>
            } />

            <Route path="/contracts/:id" element={
              <ContractDetails />
            } />

            <Route path="/settings" element={
              <div className="p-4 md:p-6 h-full">
                <Settings />
              </div>
            } />

            <Route path="/feature/:id/edit" element={
              <div className="p-4 md:p-6 h-full">
                <FeatureEditor />
              </div>
            } />

          </Routes>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const handleLogin = (username: string) => {
    setIsAuthenticated(true);
    setCurrentUser(username);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <MainLayout currentUser={currentUser} handleLogout={handleLogout} />
    </HashRouter>
  );
};

export default App;
