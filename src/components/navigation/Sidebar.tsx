import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  PieChart,
  Clock,
  Briefcase,
  Users,
  Lightbulb,
  Settings,
  PlusCircle,
  ChevronDown,
  ArrowLeft,
  User,
  LogOut,
  LogIn,
} from 'lucide-react';
import { WorkspaceTab, EventPlan } from '../../types';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  events: EventPlan[];
  selectedEvent: EventPlan | null;
  onSelectEvent: (event: EventPlan) => void;
  onOpenWizard: () => void;
  onBackToLanding: () => void;
  onOpenAuth?: (mode: 'signin' | 'signup') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  events,
  selectedEvent,
  onSelectEvent,
  onOpenWizard,
  onBackToLanding,
  onOpenAuth,
}) => {
  const { user, isAuthenticated, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'events', label: 'My Events', icon: CalendarDays },
    { id: 'ai-planner', label: 'AI Planner', icon: Sparkles, badge: 'AI' },
    { id: 'budget', label: 'Budget Studio', icon: PieChart },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'vendors', label: 'Vendors', icon: Briefcase },
    { id: 'guests', label: 'Guest Experience', icon: Users },
    { id: 'inspiration', label: 'Ideas & Inspiration', icon: Lightbulb },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside role="navigation" aria-label="Workspace Navigation" className="flex h-full w-full flex-col border-r border-brand-border bg-brand-surface p-4 transition-colors duration-200 overflow-y-auto overflow-x-hidden">
      {/* Brand Header */}
      <div className="shrink-0 mb-3 flex items-center justify-between pb-3 border-b border-brand-border/60">
        <BrandLogo size="sm" showTagline={false} />
      </div>

      {/* Return to Landing */}
      <button
        onClick={onBackToLanding}
        className="shrink-0 mb-3 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-brand-text-secondary transition-colors hover:text-brand-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Public Landing</span>
      </button>

      {/* Event Selector Card */}
      <div className="shrink-0 relative mb-4">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex w-full items-center justify-between rounded-xl border border-brand-border bg-brand-elevated/70 p-3 text-left transition-all hover:border-brand-primary/50"
        >
          <div className="min-w-0 flex-1 pr-2">
            <div className="text-[10px] font-semibold tracking-wider text-brand-primary uppercase">Active Event</div>
            <div className="truncate text-sm font-bold text-brand-text">
              {selectedEvent ? selectedEvent.name : 'No event selected'}
            </div>
            {selectedEvent && (
              <div className="text-xs text-brand-text-secondary">
                {selectedEvent.date} · {selectedEvent.guestCount} guests
              </div>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-brand-text-secondary transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Options */}
        {dropdownOpen && (
          <div className="absolute left-0 top-full z-30 mt-1.5 w-full rounded-xl border border-brand-border bg-brand-surface p-1.5 shadow-xl">
            <div className="max-h-48 overflow-y-auto">
              {events.length === 0 ? (
                <div className="p-3 text-center text-xs text-brand-text-secondary">
                  No active celebrations yet
                </div>
              ) : (
                events.map(evt => (
                  <button
                    key={evt.id}
                    onClick={() => {
                      onSelectEvent(evt);
                      setDropdownOpen(false);
                    }}
                    className={`flex w-full flex-col rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                      selectedEvent?.id === evt.id ? 'bg-brand-soft text-brand-deep font-semibold' : 'text-brand-text hover:bg-brand-elevated'
                    }`}
                  >
                    <span className="truncate">{evt.name}</span>
                    <span className="text-[10px] text-brand-text-secondary">
                      {evt.eventType.toUpperCase()} · {evt.date}
                    </span>
                  </button>
                ))
              )}
            </div>
            <div className="mt-1 border-t border-brand-border pt-1">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenWizard();
                }}
                className="flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-brand-primary hover:bg-brand-soft"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Create New Celebration</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation List */}
      <nav role="tablist" aria-label="Workspace Navigation Tabs" className="shrink-0 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as WorkspaceTab)}
              className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-primary text-white shadow-sm shadow-brand-primary/20'
                  : 'text-brand-text-secondary hover:bg-brand-elevated hover:text-brand-text'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-brand-text-secondary group-hover:text-brand-primary'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-brand-soft text-brand-deep'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Create Action Card & User Card */}
      <div className="shrink-0 mt-4 pt-4 pb-2 space-y-3 border-t border-brand-border/60">
        <button
          onClick={onOpenWizard}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand-primary/60 bg-brand-soft/50 py-2.5 text-xs font-semibold text-brand-deep transition-all hover:bg-brand-soft hover:scale-[1.01] active:scale-[0.99]"
        >
          <Sparkles className="h-3.5 w-3.5 text-brand-primary" />
          <span>New AI Celebration</span>
        </button>

        {/* Authenticated User Account Strip */}
        {isAuthenticated ? (
          <div className="flex items-center justify-between rounded-2xl border border-brand-border bg-brand-elevated/40 p-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-xs font-bold text-white shadow-sm">
                {user?.fullName?.slice(0, 1).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-brand-text">{user?.fullName}</p>
                <p className="truncate text-[10px] text-brand-text-secondary">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="rounded-lg p-1.5 text-brand-text-secondary hover:bg-red-500/10 hover:text-red-500 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onOpenAuth?.('signin')}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-border bg-brand-surface py-2 text-xs font-semibold text-brand-text hover:border-brand-primary transition-colors"
          >
            <LogIn className="h-3.5 w-3.5 text-brand-primary" />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </aside>
  );
};
