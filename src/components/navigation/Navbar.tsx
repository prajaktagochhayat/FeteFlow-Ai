import React, { useState } from 'react';
import {
  Sparkles,
  Moon,
  Sun,
  Menu,
  X,
  Calendar,
  Layers,
  Compass,
  HelpCircle,
  User,
  LogOut,
  ChevronDown,
  LogIn,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onOpenWizard: () => void;
  onNavigateLandingSection: (sectionId: string) => void;
  onEnterWorkspace: () => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isInWorkspace?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenWizard,
  onNavigateLandingSection,
  onEnterWorkspace,
  onOpenAuth,
  theme,
  onToggleTheme,
  isInWorkspace = false,
}) => {
  const { user, isAuthenticated, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header role="banner" aria-label="Top Navigation Bar" className="sticky top-0 z-40 border-b border-brand-border/60 bg-brand-bg/85 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <button
          onClick={() => (isInWorkspace ? onNavigateLandingSection('hero') : window.scrollTo({ top: 0, behavior: 'smooth' }))}
          className="text-left focus:outline-none"
        >
          <BrandLogo size="md" showTagline={true} />
        </button>

        {/* Desktop Navigation Links */}
        {!isInWorkspace && (
          <nav role="navigation" aria-label="Main Navigation" className="hidden items-center gap-7 md:flex">
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
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle visual theme"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-border bg-brand-surface text-brand-text-secondary transition-all hover:border-brand-primary hover:text-brand-primary"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* User Auth: Logged Out -> Sign In / Sign Up buttons */}
          {!isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('signin')}
                className="rounded-xl border border-brand-border bg-brand-surface px-3 py-1.5 text-xs font-semibold text-brand-text hover:border-brand-primary hover:text-brand-primary transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="rounded-xl bg-brand-primary/10 border border-brand-primary/30 px-3 py-1.5 text-xs font-bold text-brand-primary hover:bg-brand-primary hover:text-white transition-all"
              >
                Sign Up
              </button>
            </div>
          ) : (
            /* User Auth: Logged In -> User Avatar Pill */
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-brand-border bg-brand-surface px-2.5 py-1.5 text-xs font-semibold text-brand-text hover:border-brand-primary transition-all"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-primary text-[11px] font-bold text-white shadow-sm">
                  {user?.fullName?.slice(0, 1).toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:inline-block max-w-[100px] truncate">{user?.fullName}</span>
                <ChevronDown className="h-3 w-3 text-brand-text-secondary" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-brand-border bg-brand-surface p-2 shadow-xl z-50">
                  <div className="px-3 py-2 border-b border-brand-border/60">
                    <p className="text-xs font-bold text-brand-text truncate">{user?.fullName}</p>
                    <p className="text-[10px] text-brand-text-secondary truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    {!isInWorkspace && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onEnterWorkspace();
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-brand-text hover:bg-brand-elevated transition-colors"
                      >
                        <Calendar className="h-3.5 w-3.5 text-brand-primary" />
                        <span>Go to Workspace</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        signOut();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Start Planning Primary CTA */}
          <button
            onClick={onOpenWizard}
            className="hidden items-center gap-2 rounded-xl bg-brand-primary px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-brand-primary/25 transition-all hover:bg-brand-primary-hover hover:scale-[1.02] active:scale-[0.98] sm:flex"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Plan with AI</span>
          </button>

          {/* Workspace Quick Link when on landing */}
          {!isInWorkspace && (
            <button
              onClick={onEnterWorkspace}
              className="rounded-xl border border-brand-border bg-brand-surface px-3 py-1.5 text-xs font-semibold text-brand-text transition-colors hover:border-brand-primary hover:text-brand-primary"
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

            {/* Mobile Auth Actions */}
            {!isAuthenticated ? (
              <div className="flex gap-2 pt-2 border-t border-brand-border/60">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signin');
                  }}
                  className="flex-1 rounded-xl border border-brand-border py-2 text-center text-xs font-semibold text-brand-text"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signup');
                  }}
                  className="flex-1 rounded-xl bg-brand-primary/10 border border-brand-primary/30 py-2 text-center text-xs font-bold text-brand-primary"
                >
                  Sign Up
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-primary text-[11px] font-bold text-white">
                    {user?.fullName?.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-brand-text truncate">{user?.fullName}</span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="text-xs font-semibold text-red-500 hover:underline"
                >
                  Sign Out
                </button>
              </div>
            )}

            <button
              onClick={() => {
                onOpenWizard();
                setMobileMenuOpen(false);
              }}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary py-2.5 text-sm font-medium text-white shadow-md shadow-brand-primary/20"
            >
              <Sparkles className="h-4 w-4" />
              Plan with AI
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

