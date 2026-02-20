import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectMap from './components/ProjectMap';
import ProjectTimeline from './components/ProjectTimeline';
import { MOCK_DATA, AGREEMENTS } from './constants';
import { ProjectFeature } from './types';
import { LayoutDashboard, Mountain, Bell, ChevronDown, Map as MapIcon, CalendarRange, Table2, Menu, X } from 'lucide-react';

type View = 'dashboard' | 'list' | 'table' | 'timeline';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectFeature[]>(MOCK_DATA);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleFeatureSelect = (id: string) => {
    setSelectedFeatureId(id);
    if (currentView === 'dashboard') {
      setCurrentView('list');
    }
  };

  const handleUpdateProject = (updatedProject: ProjectFeature) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

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

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar Navigation */}
      <aside className={`
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-[#0f172a] text-white flex-shrink-0 flex flex-col
        transition-transform duration-300 ease-in-out
      `}>
        <div className="p-5 border-b border-gray-800 flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Mountain className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-base tracking-tight">LPMit TOMS</h1>
            <p className="text-[10px] text-gray-400 leading-tight">Task Order Management System</p>
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
          <div className="bg-emerald-900/50 border border-emerald-700/50 rounded-lg px-3 py-2">
            <p className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">Agreement</p>
            <p className="text-sm font-semibold text-emerald-100">{AGREEMENTS[0].name}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {([
            { view: 'dashboard' as View, icon: LayoutDashboard, label: 'Dashboard' },
            { view: 'list' as View, icon: MapIcon, label: 'Map & Tasks' },
            { view: 'table' as View, icon: Table2, label: 'Summary Table' },
            { view: 'timeline' as View, icon: CalendarRange, label: 'Timeline' },
          ]).map(({ view, icon: Icon, label }) => (
            <button
              key={view}
              onClick={() => handleNavClick(view)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                currentView === view
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="px-4 py-2 text-xs text-gray-500">
            <p>LPMit Programme</p>
            <p className="text-gray-600 mt-1">CEDD/GEO/LPM</p>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shadow-sm z-20 no-print">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 text-gray-600 hover:text-gray-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-800">
              {viewTitles[currentView]}
            </h2>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
              {projects.length} Features
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative text-gray-500 hover:text-gray-700 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                AE
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-medium text-gray-700 text-xs">AECOM Team</p>
                <p className="text-[10px] text-gray-500">Project Manager</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 cursor-pointer" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto bg-[#f8fafc]">
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
              <div className="flex-1 overflow-hidden p-4 md:p-6 bg-[#f8fafc]">
                <ProjectList
                  data={projects}
                  selectedId={selectedFeatureId}
                  onSelectFeature={handleFeatureSelect}
                  onUpdateFeature={handleUpdateProject}
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
