import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectMap from './components/ProjectMap';
import ProjectTimeline from './components/ProjectTimeline';
import LoginScreen from './components/LoginScreen';
import { MOCK_DATA, AGREEMENTS } from './constants';
import { ProjectFeature } from './types';
import { LayoutDashboard, Mountain, Bell, ChevronDown, Map as MapIcon, CalendarRange, Table2, Menu, X, LogOut, CheckSquare } from 'lucide-react';

type View = 'dashboard' | 'list' | 'table' | 'timeline';

const STORAGE_KEY = 'lpmit-toms-accepted';

const loadAcceptanceState = (): Record<string, { accepted: boolean; acceptedDate?: string; acceptedBy?: string }> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveAcceptanceState = (projects: ProjectFeature[]) => {
  const state: Record<string, { accepted: boolean; acceptedDate?: string; acceptedBy?: string }> = {};
  projects.forEach(p => {
    if (p.accepted) {
      state[p.id] = { accepted: true, acceptedDate: p.acceptedDate, acceptedBy: p.acceptedBy };
    }
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const initializeProjects = (): ProjectFeature[] => {
  const saved = loadAcceptanceState();
  return MOCK_DATA.map(p => ({
    ...p,
    accepted: saved[p.id]?.accepted || false,
    acceptedDate: saved[p.id]?.acceptedDate,
    acceptedBy: saved[p.id]?.acceptedBy,
  }));
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectFeature[]>(initializeProjects);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    saveAcceptanceState(projects);
  }, [projects]);

  const handleLogin = (username: string) => {
    setIsAuthenticated(true);
    setCurrentUser(username);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('dashboard');
    setSelectedFeatureId(null);
  };

  const handleFeatureSelect = (id: string) => {
    setSelectedFeatureId(id);
    if (currentView === 'dashboard') {
      setCurrentView('list');
    }
  };

  const handleUpdateProject = (updatedProject: ProjectFeature) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const handleToggleAccepted = useCallback((id: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== id) return p;
      const now = new Date();
      if (p.accepted) {
        return { ...p, accepted: false, acceptedDate: undefined, acceptedBy: undefined };
      }
      return {
        ...p,
        accepted: true,
        acceptedDate: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        acceptedBy: currentUser || 'Unknown',
      };
    }));
  }, [currentUser]);

  const handleNavClick = (view: View) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  const viewTitles: Record<View, string> = {
    dashboard: 'Project Overview',
    list: 'Map & Task Orders',
    table: 'Summary Table of Draft Task Orders',
    timeline: 'Milestone Timeline',
  };

  const acceptedCount = projects.filter(p => p.accepted).length;

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

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
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
            <Mountain className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-base tracking-tight">LPMit TOMS</h1>
            <p className="text-[10px] text-emerald-300/70 leading-tight">Task Order Management</p>
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
            <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Agreement</p>
            <p className="text-sm font-bold text-white mt-0.5">{AGREEMENTS[0].name}</p>
          </div>
        </div>

        {/* Acceptance Counter */}
        <div className="px-4 pt-2 pb-2">
          <div className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <p className="text-xs text-gray-300 font-medium">TO Accepted</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-white">{acceptedCount}</span>
                <span className="text-xs text-gray-500">/ {projects.length}</span>
              </div>
            </div>
            <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(acceptedCount / projects.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 pt-3 space-y-1">
          <p className="px-3 pb-2 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Navigation</p>
          {([
            { view: 'dashboard' as View, icon: LayoutDashboard, label: 'Dashboard' },
            { view: 'list' as View, icon: MapIcon, label: 'Map & Tasks' },
            { view: 'table' as View, icon: Table2, label: 'Summary Table' },
            { view: 'timeline' as View, icon: CalendarRange, label: 'Timeline' },
          ]).map(({ view, icon: Icon, label }) => (
            <button
              key={view}
              onClick={() => handleNavClick(view)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                currentView === view
                  ? 'bg-emerald-500/20 text-emerald-300 shadow-lg shadow-emerald-900/10 border border-emerald-500/30'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent'
              }`}
            >
              <Icon className={`w-[18px] h-[18px] ${currentView === view ? 'text-emerald-400' : ''}`} />
              <span className="font-medium text-sm">{label}</span>
            </button>
          ))}
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
              {viewTitles[currentView]}
            </h2>
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {projects.length} Features
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
          {currentView === 'dashboard' && (
            <div className="p-4 md:p-6 max-w-7xl mx-auto">
              <Dashboard data={projects} onFeatureSelect={handleFeatureSelect} />
            </div>
          )}
          {currentView === 'list' && (
            <div className="flex flex-col h-full">
              <div className="h-1/3 min-h-[280px] w-full border-b border-gray-200 shadow-sm relative z-0">
                <ProjectMap
                  data={projects}
                  selectedId={selectedFeatureId}
                  onSelectFeature={handleFeatureSelect}
                />
              </div>
              <div className="flex-1 overflow-hidden p-4 md:p-6 bg-[#f1f5f9]">
                <ProjectList
                  data={projects}
                  selectedId={selectedFeatureId}
                  onSelectFeature={handleFeatureSelect}
                  onUpdateFeature={handleUpdateProject}
                  onToggleAccepted={handleToggleAccepted}
                />
              </div>
            </div>
          )}
          {currentView === 'table' && (
            <div className="p-4 md:p-6 h-full">
              <ProjectList
                data={projects}
                selectedId={selectedFeatureId}
                onSelectFeature={handleFeatureSelect}
                onUpdateFeature={handleUpdateProject}
                onToggleAccepted={handleToggleAccepted}
                fullTable
              />
            </div>
          )}
          {currentView === 'timeline' && (
            <div className="p-4 md:p-6 h-full">
              <ProjectTimeline
                data={projects}
                selectedId={selectedFeatureId}
                onSelectProject={setSelectedFeatureId}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
