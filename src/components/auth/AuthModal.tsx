import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Database,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'signin',
  onSuccess,
}) => {
  const { signIn, signUp, isSupabase } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'signup' && !fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
        setSuccessMessage('Welcome back to FêteFlow!');
      } else {
        await signUp(email, password, fullName);
        setSuccessMessage('Account created! Setting up your celebration workspace...');
      }

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-brand-border bg-brand-surface shadow-2xl transition-colors duration-200">
        {/* Top Gradient Ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-brand-primary via-purple-500 to-brand-coral" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-brand-text-secondary hover:bg-brand-elevated hover:text-brand-text"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Logo & Headline */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-1">
              <BrandLogo size="md" showTagline={false} />
            </div>
            <h2 className="font-serif text-2xl font-bold text-brand-text">
              {mode === 'signin' ? 'Welcome Back' : 'Create Your Account'}
            </h2>
            <p className="text-xs text-brand-text-secondary max-w-xs mx-auto">
              {mode === 'signin'
                ? 'Sign in to access your bespoke celebrations, budgets, and guest rosters.'
                : 'Join FêteFlow AI to orchestrate unforgettable events with isolated private data.'}
            </p>
          </div>

          {/* Database & Cloud Connection Indicator */}
          <div className="flex items-center justify-center gap-2 rounded-xl bg-brand-soft/40 px-3 py-1.5 text-[11px] text-brand-deep font-semibold">
            {isSupabase ? (
              <>
                <Database className="h-3.5 w-3.5 text-emerald-500" />
                <span>Connected to Supabase PostgreSQL (Live Auth & RLS)</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-brand-primary" />
                <span>Isolated Workspace Account (Ready for Supabase)</span>
              </>
            )}
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1 rounded-2xl border border-brand-border bg-brand-elevated/50 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`rounded-xl py-2 text-xs font-bold transition-all ${
                mode === 'signin'
                  ? 'bg-brand-surface text-brand-primary shadow-sm'
                  : 'text-brand-text-secondary hover:text-brand-text'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`rounded-xl py-2 text-xs font-bold transition-all ${
                mode === 'signup'
                  ? 'bg-brand-surface text-brand-primary shadow-sm'
                  : 'text-brand-text-secondary hover:text-brand-text'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-[11px] font-semibold text-brand-text-secondary uppercase">Full Name</label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-brand-text-secondary" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Ananya Verma"
                    required
                    className="w-full rounded-xl border border-brand-border bg-brand-elevated pl-10 pr-4 py-2.5 text-xs text-brand-text focus:border-brand-primary focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-semibold text-brand-text-secondary uppercase">Email Address</label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-brand-text-secondary" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full rounded-xl border border-brand-border bg-brand-elevated pl-10 pr-4 py-2.5 text-xs text-brand-text focus:border-brand-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-brand-text-secondary uppercase">Password</label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-brand-text-secondary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full rounded-xl border border-brand-border bg-brand-elevated pl-10 pr-10 py-2.5 text-xs text-brand-text focus:border-brand-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-brand-text-secondary hover:text-brand-text"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-primary py-3 text-xs font-bold text-white shadow-md shadow-brand-primary/25 transition-all hover:bg-brand-primary-hover disabled:opacity-50"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In to Workspace' : 'Create My Account'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
