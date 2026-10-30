import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Navbar } from './components/navigation/Navbar';
import { Sidebar } from './components/navigation/Sidebar';
import { CustomCursor } from './components/common/CustomCursor';
import { EventWizardModal } from './components/wizard/EventWizardModal';
import { AuthModal } from './components/auth/AuthModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingSkeleton } from './components/common/LoadingSkeleton';

import { EventPlan, WorkspaceTab } from './types';
import { ApiService } from './services/api';

// Dynamic Code-Splitting: Lazy load workspace modules for optimal bundle size and first contentful paint
const LandingPage = lazy(() => import('./components/landing/LandingPage').then(m => ({ default: m.LandingPage })));
const DashboardOverview = lazy(() => import('./components/workspace/DashboardOverview').then(m => ({ default: m.DashboardOverview })));
const EventsList = lazy(() => import('./components/workspace/EventsList').then(m => ({ default: m.EventsList })));
const BudgetStudio = lazy(() => import('./components/workspace/BudgetStudio').then(m => ({ default: m.BudgetStudio })));
const TimelineManager = lazy(() => import('./components/workspace/TimelineManager').then(m => ({ default: m.TimelineManager })));
const VendorHub = lazy(() => import('./components/workspace/VendorHub').then(m => ({ default: m.VendorHub })));
const GuestStudio = lazy(() => import('./components/workspace/GuestStudio').then(m => ({ default: m.GuestStudio })));
const InspirationStudio = lazy(() => import('./components/workspace/InspirationStudio').then(m => ({ default: m.InspirationStudio })));
const AIPlannerChat = lazy(() => import('./components/workspace/AIPlannerChat').then(m => ({ default: m.AIPlannerChat })));
const SettingsView = lazy(() => import('./components/workspace/SettingsView').then(m => ({ default: m.SettingsView })));

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  return String(err);
};

const MainApp: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // Auth Modal State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Theme management with persistence
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('feteflow_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('feteflow_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Navigation State
  const [viewMode, setViewMode] = useState<'landing' | 'workspace'>('landing');
  const [currentTab, setCurrentTab] = useState<WorkspaceTab>('overview');
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Events State
  const [events, setEvents] = useState<EventPlan[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventPlan | null>(null);
  const [, setLoadingEvents] = useState(true);

  // Fetch events for active user session
  const loadEvents = async () => {
    try {
      setLoadingEvents(true);
      if (!user) {
        setEvents([]);
        setSelectedEvent(null);
        return;
      }
      const data = await ApiService.getEvents(user.id);
      setEvents(data);
      if (data.length > 0) {
        setSelectedEvent(data[0]);
      } else {
        setSelectedEvent(null);
      }
    } catch (err: unknown) {
      console.error('Failed to load events:', getErrorMessage(err));
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [user?.id]);

  const handleEventCreated = (newEvent: EventPlan) => {
    setEvents(prev => [newEvent, ...prev]);
    setSelectedEvent(newEvent);
    setViewMode('workspace');
    setCurrentTab('overview');
  };

  const handleUpdateEvent = async (updates: Partial<EventPlan>) => {
    if (!selectedEvent?.id) return;
    try {
      const updated = await ApiService.updateEvent(selectedEvent.id, updates);
      setSelectedEvent(updated);
      setEvents(prev => prev.map(e => (e.id === updated.id ? updated : e)));
    } catch (err: unknown) {
      alert('Failed to update event: ' + getErrorMessage(err));
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await ApiService.deleteEvent(id);
      const remaining = events.filter(e => e.id !== id);
      setEvents(remaining);
      if (selectedEvent?.id === id) {
        setSelectedEvent(remaining[0] || null);
      }
    } catch (err: unknown) {
      alert('Failed to delete event: ' + getErrorMessage(err));
    }
  };

  const handleSelectDemoEvent = (event: EventPlan) => {
    setSelectedEvent(event);
    setViewMode('workspace');
    setCurrentTab('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateLandingSection = (sectionId: string) => {
    setViewMode('landing');
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  const handleOpenWizard = () => {
    if (!isAuthenticated) {
      setAuthMode('signup');
      setIsAuthOpen(true);
      return;
    }
    setIsWizardOpen(true);
  };

  const handleEnterWorkspace = () => {
    if (!isAuthenticated) {
      setAuthMode('signin');
      setIsAuthOpen(true);
      return;
    }
    setViewMode('workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans transition-colors duration-200">
      {/* Accessible Skip Link for Screen Readers & Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999999] focus:rounded-xl focus:bg-brand-primary focus:px-4 focus:py-2 focus:text-white focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Global Top Navbar */}
      <Navbar
        onOpenWizard={handleOpenWizard}
        onNavigateLandingSection={handleNavigateLandingSection}
        onEnterWorkspace={handleEnterWorkspace}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setIsAuthOpen(true);
        }}
        theme={theme}
        onToggleTheme={toggleTheme}
        isInWorkspace={viewMode === 'workspace'}
      />

      {/* Main View Area */}
      {viewMode === 'landing' ? (
        <main className="flex-1">
          <ErrorBoundary fallbackTitle="Error loading Landing Page">
            <Suspense fallback={<LoadingSkeleton label="Loading FêteFlow AI Experience..." />}>
              <LandingPage
                onOpenWizard={handleOpenWizard}
                onSelectDemoEvent={handleSelectDemoEvent}
                demoEvents={events}
              />
            </Suspense>
          </ErrorBoundary>
        </main>
      ) : (
        /* Workspace View with Sidebar */
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Left Sidebar */}
          <div className="hidden md:block w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16">
            <Sidebar
              currentTab={currentTab}
              onSelectTab={setCurrentTab}
              events={events}
              selectedEvent={selectedEvent}
              onSelectEvent={setSelectedEvent}
              onOpenWizard={handleOpenWizard}
              onBackToLanding={() => setViewMode('landing')}
              onOpenAuth={(mode) => {
                setAuthMode(mode);
                setIsAuthOpen(true);
              }}
            />
          </div>

          {/* Workspace Tab Content */}
          <main id="main-content" tabIndex={-1} role="main" aria-label="Celebration Workspace" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              {/* Mobile workspace sub-nav */}
              <div className="mb-4 flex items-center justify-between overflow-x-auto pb-2 md:hidden border-b border-brand-border">
                <select
                  value={currentTab}
                  onChange={e => setCurrentTab(e.target.value as WorkspaceTab)}
                  className="rounded-xl border border-brand-border bg-brand-surface px-3 py-1.5 text-xs font-semibold text-brand-text"
                >
                  <option value="overview">Overview</option>
                  <option value="events">My Events</option>
                  <option value="ai-planner">AI Planner</option>
                  <option value="budget">Budget Studio</option>
                  <option value="timeline">Timeline</option>
                  <option value="vendors">Vendors</option>
                  <option value="guests">Guest Experience</option>
                  <option value="inspiration">Inspiration</option>
                  <option value="settings">Settings</option>
                </select>

                <button
                  onClick={() => setIsWizardOpen(true)}
                  className="rounded-xl bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white"
                >
                  + New
                </button>
              </div>

              <ErrorBoundary fallbackTitle="Error loading workspace module" onReset={loadEvents}>
                <Suspense fallback={<LoadingSkeleton label={`Loading ${currentTab.toUpperCase()} studio...`} />}>
                  {currentTab === 'settings' ? (
                    <SettingsView
                      currentTheme={theme}
                      onToggleTheme={toggleTheme}
                      events={events}
                      onResetCompleted={loadEvents}
                    />
                  ) : currentTab === 'events' ? (
                    <EventsList
                      events={events}
                      selectedEvent={selectedEvent}
                      onSelectEvent={setSelectedEvent}
                      onOpenWizard={() => setIsWizardOpen(true)}
                      onDeleteEvent={handleDeleteEvent}
                    />
                  ) : selectedEvent ? (
                    <>
                      {currentTab === 'overview' && (
                        <DashboardOverview
                          event={selectedEvent}
                          onNavigateTab={setCurrentTab}
                          onUpdateEvent={handleUpdateEvent}
                          onOpenWizard={() => setIsWizardOpen(true)}
                        />
                      )}

                      {currentTab === 'ai-planner' && (
                        <AIPlannerChat event={selectedEvent} />
                      )}

                      {currentTab === 'budget' && (
                        <BudgetStudio
                          event={selectedEvent}
                          onUpdateEvent={handleUpdateEvent}
                        />
                      )}

                      {currentTab === 'timeline' && (
                        <TimelineManager
                          event={selectedEvent}
                          onUpdateEvent={handleUpdateEvent}
                        />
                      )}

                      {currentTab === 'vendors' && (
                        <VendorHub
                          event={selectedEvent}
                          onUpdateEvent={handleUpdateEvent}
                        />
                      )}

                      {currentTab === 'guests' && (
                        <GuestStudio
                          event={selectedEvent}
                          onUpdateEvent={handleUpdateEvent}
                        />
                      )}

                      {currentTab === 'inspiration' && (
                        <InspirationStudio
                          event={selectedEvent}
                          onUpdateEvent={handleUpdateEvent}
                        />
                      )}
                    </>
                  ) : (
                    <div className="mx-auto my-12 max-w-xl rounded-3xl border border-brand-border bg-brand-surface p-10 text-center shadow-sm">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                        <span className="text-3xl">✨</span>
                      </div>
                      <h3 className="font-serif text-2xl font-bold text-brand-text">Your Celebration Workspace is Ready</h3>
                      <p className="mt-2 text-sm text-brand-text-secondary leading-relaxed">
                        Start a brand-new celebration tailored to your dates, guests, and Indian Rupee budget ceiling. Powered live by your connected Gemini GenAI.
                      </p>
                      <button
                        onClick={handleOpenWizard}
                        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand-primary px-8 py-3.5 text-xs font-bold text-white shadow-lg shadow-brand-primary/25 transition-all hover:bg-brand-primary-hover hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <span>✦ Plan Celebration with AI</span>
                      </button>
                    </div>
                  )}
                </Suspense>
              </ErrorBoundary>
            </div>
          </main>
        </div>
      )}

      {/* 5-Step Event Creation Wizard Modal */}
      <EventWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onEventCreated={handleEventCreated}
      />

      {/* Authentication Modal (Sign In / Register) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode={authMode}
        onSuccess={() => setViewMode('workspace')}
      />

      {/* Custom Magnetic Cursor (Rendered on top of all modals and views) */}
      <CustomCursor />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
