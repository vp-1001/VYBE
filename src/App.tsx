import React, { useState, useEffect } from 'react';
import { EventProvider, useEvent } from './context/EventContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { AIEventWizard } from './components/wizard/AIEventWizard';
import { BudgetStudio } from './components/budget/BudgetStudio';
import { TimelineManager } from './components/timeline/TimelineManager';
import { ThemeStudio } from './components/themes/ThemeStudio';
import { VendorComparison } from './components/vendors/VendorComparison';
import { CollaborativePlanning } from './components/collaboration/CollaborativePlanning';
import { EventDayCommandCenter } from './components/eventday/EventDayCommandCenter';
import { SettingsView } from './components/settings/SettingsView';
import { AICopilotDrawer } from './components/copilot/AICopilotDrawer';
import { LayoutDashboard, CalendarDays, PieChart, ListTodo, RadioTower, Palette } from 'lucide-react';

function AppContent() {
  const { activeEvent } = useEvent();

  // Navigation state
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);

  // Check URL query parameters (e.g. ?autostart=1 or ?view=budget)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam) {
      setCurrentView(viewParam);
    }
  }, []);

  // Render view router
  const renderMainView = () => {
    switch (currentView) {
      case 'landing':
        return (
          <LandingPage
            onStartPlanning={() => setIsWizardOpen(true)}
            onExploreThemes={() => setCurrentView('themes')}
            onOpenDashboard={() => setCurrentView('dashboard')}
          />
        );
      case 'dashboard':
      case 'events':
        return (
          <DashboardOverview
            onOpenCreateWizard={() => setIsWizardOpen(true)}
            onNavigate={(v) => setCurrentView(v)}
          />
        );
      case 'budget':
        return <BudgetStudio />;
      case 'timeline':
        return <TimelineManager />;
      case 'themes':
        return <ThemeStudio />;
      case 'vendors':
        return <VendorComparison />;
      case 'collaborators':
        return <CollaborativePlanning />;
      case 'eventday':
        return <EventDayCommandCenter />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <DashboardOverview
            onOpenCreateWizard={() => setIsWizardOpen(true)}
            onNavigate={(v) => setCurrentView(v)}
          />
        );
    }
  };

  // If in landing view, don't show full persistent sidebar
  const isLanding = currentView === 'landing';

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] flex flex-col transition-colors selection:bg-violet-500/20">
      {/* Top Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={(v) => setCurrentView(v)}
        onOpenCreateWizard={() => setIsWizardOpen(true)}
        onToggleCopilot={() => setIsCopilotOpen(!isCopilotOpen)}
        copilotOpen={isCopilotOpen}
      />

      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar (hidden on landing page) */}
        {!isLanding && (
          <div className="hidden md:block">
            <Sidebar
              currentView={currentView}
              onNavigate={(v) => setCurrentView(v)}
              onOpenCreateWizard={() => setIsWizardOpen(true)}
            />
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden pb-16 md:pb-6">
          {renderMainView()}
        </main>
      </div>

      {/* Mobile Navigation Bar (fixed bottom for handy mobile browsing) */}
      {!isLanding && (
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-card)]/95 backdrop-blur-md border-t border-[var(--border-main)] flex items-center justify-around py-2 px-1"
        >
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
              currentView === 'dashboard' ? 'text-violet-600' : 'text-[var(--text-muted)]'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>My Events</span>
          </button>
          <button
            onClick={() => setCurrentView('budget')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
              currentView === 'budget' ? 'text-violet-600' : 'text-[var(--text-muted)]'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Budget</span>
          </button>
          <button
            onClick={() => setCurrentView('timeline')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
              currentView === 'timeline' ? 'text-violet-600' : 'text-[var(--text-muted)]'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            <span>Tasks</span>
          </button>
          <button
            onClick={() => setCurrentView('eventday')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
              currentView === 'eventday' ? 'text-violet-600' : 'text-[var(--text-muted)]'
            }`}
          >
            <RadioTower className="w-4 h-4" />
            <span>Day-Of</span>
          </button>
          <button
            onClick={() => setCurrentView('themes')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
              currentView === 'themes' ? 'text-violet-600' : 'text-[var(--text-muted)]'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Themes</span>
          </button>
        </nav>
      )}

      {/* AI Event Creation Wizard Modal */}
      {isWizardOpen && (
        <AIEventWizard
          onClose={() => setIsWizardOpen(false)}
          onPlanAccepted={(newEvent) => {
            setIsWizardOpen(false);
            setCurrentView('dashboard');
          }}
        />
      )}

      {/* Persistent AI Copilot Assistant Drawer */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <EventProvider>
      <AppContent />
    </EventProvider>
  );
}
