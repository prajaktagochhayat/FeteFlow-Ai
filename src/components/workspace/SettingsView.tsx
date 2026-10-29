import React, { useState, useEffect } from 'react';
import {
  Settings,
  Download,
  Check,
  Moon,
  Sun,
  FileText,
} from 'lucide-react';
import { AppSettings, EventPlan } from '../../types';
import { ApiService } from '../../services/api';
import { exportEventsToWord } from '../../utils/wordExport';

interface SettingsViewProps {
  currentTheme: 'light' | 'dark';
  onToggleTheme: () => void;
  events: EventPlan[];
  onResetCompleted?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentTheme,
  onToggleTheme,
  events,
}) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [currencyInput, setCurrencyInput] = useState('INR');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await ApiService.getSettings();
      setSettings(data);
      setCurrencyInput(data.defaultCurrency || 'INR');
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const handleExportWord = () => {
    exportEventsToWord(events, 'FêteFlow AI - Comprehensive Celebration Planning Dossier');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-text">Settings & Personalization</h1>
        <p className="text-xs sm:text-sm text-brand-text-secondary">
          Personalize workspace theme, currency formatting, and export celebration dossiers.
        </p>
      </div>

      {/* Interface Preferences Card */}
      <div className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm space-y-4">
        <h2 className="font-serif text-lg font-bold text-brand-text">Interface & Workspace Defaults</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between rounded-2xl border border-brand-border bg-brand-elevated/40 p-4">
            <div>
              <div className="font-semibold text-xs text-brand-text">Visual Appearance</div>
              <div className="text-[10px] text-brand-text-secondary">Currently: {currentTheme.toUpperCase()} mode</div>
            </div>
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 rounded-xl border border-brand-border bg-brand-surface px-3 py-1.5 text-xs font-semibold text-brand-text hover:border-brand-primary"
            >
              {currentTheme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
              <span>Switch to {currentTheme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>

          {/* Currency */}
          <div className="flex items-center justify-between rounded-2xl border border-brand-border bg-brand-elevated/40 p-4">
            <div>
              <div className="font-semibold text-xs text-brand-text">Default Currency</div>
              <div className="text-[10px] text-brand-text-secondary">Format for new celebrations</div>
            </div>
            <select
              value={currencyInput}
              onChange={e => {
                setCurrencyInput(e.target.value);
                ApiService.updateSettings({ defaultCurrency: e.target.value });
              }}
              className="rounded-xl border border-brand-border bg-brand-surface px-3 py-1.5 text-xs font-semibold text-brand-text focus:outline-none"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Management Card */}
      <div className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm space-y-4">
        <h2 className="font-serif text-lg font-bold text-brand-text">Data Portability & Backup</h2>
        <p className="text-xs text-brand-text-secondary">
          Export your complete celebration repository to a beautifully formatted Microsoft Word (.doc) planning dossier, complete with financial breakdowns, timeline milestones, vendor briefs, and risk mitigations.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportWord}
            className="flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-primary/20 hover:bg-brand-primary-hover transition-colors"
          >
            <FileText className="h-4 w-4" />
            <span>Export Event Planning Document (Word .doc)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
