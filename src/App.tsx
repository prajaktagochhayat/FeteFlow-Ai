import React, { useState, useEffect } from 'react';
import { Navbar } from './components/navigation/Navbar';
import { Sidebar } from './components/navigation/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { CustomCursor } from './components/common/CustomCursor';
import { EventWizardModal } from './components/wizard/EventWizardModal';

// Workspace Studios
import { DashboardOverview } from './components/workspace/DashboardOverview';
import { EventsList } from './components/workspace/EventsList';
import { BudgetStudio } from './components/workspace/BudgetStudio';
import { TimelineManager } from './components/workspace/TimelineManager';
import { VendorHub } from './components/workspace/VendorHub';
import { GuestStudio } from './components/workspace/GuestStudio';
import { InspirationStudio } from './components/workspace/InspirationStudio';
import { AIPlannerChat } from './components/workspace/AIPlannerChat';
import { SettingsView } from './components/workspace/SettingsView';

import { EventPlan, WorkspaceTab } from './types';
import { ApiService } from './services/api';

export const App: React.FC = () => {
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
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Fetch initial events
  const loadEvents = async () => {
    try {
      setLoadingEvents(true);
      const data = await ApiService.getEvents();
      setEvents(data);
      if (data.length > 0 && !selectedEvent) {
        setSelectedEvent(data[0]);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

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
    } catch (err: any) {
      alert('Failed to update event: ' + err.message);
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
    } catch (err: any) {
      alert('Failed to delete event: ' + err.message);
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

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans transition-colors duration-200">
      {/* Global Top Navbar */}
      <Navbar
        onOpenWizard={() => setIsWizardOpen(true)}
        onNavigateLandingSection={handleNavigateLandingSection}
        onEnterWorkspace={() => setViewMode('workspace')}
        theme={theme}
        onToggleTheme={toggleTheme}
        isInWorkspace={viewMode === 'workspace'}
      />

      {/* Main View Area */}
      {viewMode === 'landing' ? (
        <main className="flex-1">
          <LandingPage
            onOpenWizard={() => setIsWizardOpen(true)}
            onSelectDemoEvent={handleSelectDemoEvent}
            demoEvents={events}
          />
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
              onOpenWizard={() => setIsWizardOpen(true)}
              onBackToLanding={() => setViewMode('landing')}
            />
          </div>

          {/* Workspace Tab Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
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
                    onClick={() => setIsWizardOpen(true)}
                    className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand-primary px-8 py-3.5 text-xs font-bold text-white shadow-lg shadow-brand-primary/25 transition-all hover:bg-brand-primary-hover hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>✦ Plan Celebration with AI</span>
                  </button>
                </div>
              )}
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

      {/* Custom Magnetic Cursor (Rendered on top of all modals and views) */}
      <CustomCursor />
    </div>
  );
};
