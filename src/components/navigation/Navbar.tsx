import React, { useState } from 'react';
import { Sparkles, Moon, Sun, Menu, X, Calendar, Layers, Compass, HelpCircle } from 'lucide-react';

interface NavbarProps {
  onOpenWizard: () => void;
  onNavigateLandingSection: (sectionId: string) => void;
  onEnterWorkspace: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isInWorkspace?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenWizard,
  onNavigateLandingSection,
  onEnterWorkspace,
  theme,
  onToggleTheme,
  isInWorkspace = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-border/60 bg-brand-bg/85 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <button
          onClick={() => (isInWorkspace ? onNavigateLandingSection('hero') : window.scrollTo({ top: 0, behavior: 'smooth' }))}
          className="group flex items-center gap-2.5 text-left focus:outline-none"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-deep to-brand-primary text-white shadow-md shadow-brand-primary/20 transition-transform duration-200 group-hover:scale-105">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="font-serif text-lg font-bold tracking-tight text-brand-text">
              FêteFlow <span className="font-sans text-xs font-semibold tracking-wider text-brand-coral uppercase">AI</span>
            </div>
            <div className="hidden text-[10px] font-medium tracking-wide text-brand-text-secondary sm:block">
              Big moments. Zero chaos.
            </div>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        {!isInWorkspace && (
          <nav className="hidden items-center gap-7 md:flex">
            <button
              onClick={() => onNavigateLandingSection('discover')}
              className="text-sm font-medium text-brand-text-secondary transition-colors hover:text-brand-primary"
            >
              Discover
            </button>
            <button
              onClick={() => onNavigateLandingSection('how-it-works')}
              className="text-sm font-medium text-brand-text-secondary transition-colors hover:text-brand-primary"
            >
              How It Works
            </button>
            <button
              onClick={() => onNavigateLandingSection('features')}
              className="text-sm font-medium text-brand-text-secondary transition-colors hover:text-brand-primary"
            >
              Features
            </button>
            <button
              onClick={onEnterWorkspace}
              className="flex items-center gap-1.5 text-sm font-medium text-brand-text-secondary transition-colors hover:text-brand-primary"
            >
              <Calendar className="h-3.5 w-3.5 text-brand-coral" />
              My Events
            </button>
          </nav>
        )}

        {/* Right Action Cluster */}
        <div className="flex items-center gap-3">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle visual theme"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-border bg-brand-surface text-brand-text-secondary transition-all hover:border-brand-primary hover:text-brand-primary"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Start Planning Primary CTA */}
          <button
            onClick={onOpenWizard}
            className="hidden items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow-md shadow-brand-primary/25 transition-all hover:bg-brand-primary-hover hover:scale-[1.02] active:scale-[0.98] sm:flex"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Start Planning</span>
          </button>

          {/* Workspace Quick Link when on landing */}
          {!isInWorkspace && (
            <button
              onClick={onEnterWorkspace}
              className="rounded-xl border border-brand-border bg-brand-surface px-3 py-2 text-xs font-medium text-brand-text transition-colors hover:border-brand-primary hover:text-brand-primary sm:text-sm"
            >
              Workspace
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-border bg-brand-surface text-brand-text md:hidden"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-brand-border bg-brand-surface px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                onNavigateLandingSection('discover');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-left text-sm font-medium text-brand-text py-1.5"
            >
              <Compass className="h-4 w-4 text-brand-primary" />
              Discover
            </button>
            <button
              onClick={() => {
                onNavigateLandingSection('how-it-works');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-left text-sm font-medium text-brand-text py-1.5"
            >
              <HelpCircle className="h-4 w-4 text-brand-primary" />
              How It Works
            </button>
            <button
              onClick={() => {
                onNavigateLandingSection('features');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-left text-sm font-medium text-brand-text py-1.5"
            >
              <Layers className="h-4 w-4 text-brand-primary" />
              Features
            </button>
            <button
              onClick={() => {
                onEnterWorkspace();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-left text-sm font-medium text-brand-text py-1.5"
            >
              <Calendar className="h-4 w-4 text-brand-coral" />
              My Events Workspace
            </button>
            <button
              onClick={() => {
                onOpenWizard();
                setMobileMenuOpen(false);
              }}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary py-2.5 text-sm font-medium text-white shadow-md shadow-brand-primary/20"
            >
              <Sparkles className="h-4 w-4" />
              Start Planning
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
