import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sparkles,
  Key,
  Shield,
  Download,
  RotateCcw,
  Check,
  Moon,
  Sun,
  Laptop,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { AppSettings, EventPlan } from '../../types';
import { ApiService } from '../../services/api';

interface SettingsViewProps {
  currentTheme: 'light' | 'dark';
  onToggleTheme: () => void;
  events: EventPlan[];
  onResetCompleted: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentTheme,
  onToggleTheme,
  events,
  onResetCompleted,
}) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [modelInput, setModelInput] = useState('gemini-1.5-flash');
  const [currencyInput, setCurrencyInput] = useState('INR');
  const [savingKey, setSavingKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await ApiService.getSettings();
      setSettings(data);
      setModelInput(data.geminiModel || 'gemini-1.5-flash');
      setCurrencyInput(data.defaultCurrency || 'INR');
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const handleSaveApiKey = async () => {
    setSavingKey(true);
    setSaveSuccess(false);
    try {
      const updated = await ApiService.updateSettings({
        geminiApiKey: apiKeyInput.trim(),
        geminiModel: modelInput,
        defaultCurrency: currencyInput,
      });
      setSettings(updated);
      setApiKeyInput('');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert('Failed to update settings: ' + err.message);
    } finally {
      setSavingKey(false);
    }
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `feteflow_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleResetData = async () => {
    if (confirm('Are you sure you want to reset all celebrations to factory demo data? This will restore the initial wedding, birthday, and community fair.')) {
      try {
        await ApiService.resetData();
        alert('Factory data restored successfully.');
        onResetCompleted();
      } catch (err: any) {
        alert('Failed to reset: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-text">Settings & Personalization</h1>
        <p className="text-xs sm:text-sm text-brand-text-secondary">
          Configure server-side GenAI keys, preferences, and data persistence.
        </p>
      </div>

      {/* AI Provider & Security Card */}
      <div className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-brand-text">Google Gemini API Configuration</h2>
              <p className="text-xs text-brand-text-secondary">
                Configure your server-side Gemini model credentials securely.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                settings?.hasApiKey
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
              }`}
            >
              {settings?.hasApiKey ? '● Gemini Connected' : '○ Demo / Offline Mode'}
            </span>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-start gap-2.5 rounded-2xl border border-brand-primary/20 bg-brand-soft/30 p-3.5 text-xs text-brand-text">
          <Shield className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
          <p className="leading-relaxed text-xs">
            <strong>Security Guarantee:</strong> API keys are held strictly on the Node.js backend. They are never transmitted to browser bundles, client logs, or third parties. When no key is entered, FêteFlow uses its high-taste local planning engine seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
          <div>
            <label className="text-xs font-semibold text-brand-text-secondary uppercase">
              Gemini API Key {settings?.geminiApiKey && <span className="text-[10px] text-brand-primary font-normal">({settings.geminiApiKey})</span>}
            </label>
            <input
              type="password"
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              placeholder={settings?.hasApiKey ? 'Enter new key to replace existing' : 'Paste AIzaSy... key here'}
              className="mt-1.5 w-full rounded-xl border border-brand-border bg-brand-elevated px-4 py-2.5 text-xs text-brand-text focus:border-brand-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-text-secondary uppercase">
              Model Identifier
            </label>
            <select
              value={modelInput}
              onChange={e => setModelInput(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-brand-border bg-brand-elevated px-4 py-2.5 text-xs font-semibold text-brand-text focus:border-brand-primary focus:outline-none"
            >
              <option value="gemini-1.5-flash">gemini-1.5-flash (Fast & Recommended)</option>
              <option value="gemini-1.5-pro">gemini-1.5-pro (High Reasoning)</option>
              <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp (Experimental)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {saveSuccess && (
            <span className="flex items-center gap-1 text-xs text-emerald-500 font-semibold">
              <Check className="h-4 w-4" /> Settings updated
            </span>
          )}
          <button
            onClick={handleSaveApiKey}
            disabled={savingKey}
            className="flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2 text-xs font-bold text-white shadow-md shadow-brand-primary/20 hover:bg-brand-primary-hover disabled:opacity-50"
          >
            {savingKey ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            <span>{savingKey ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
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
          Export your complete celebration repository to standard JSON or restore initial demonstration events.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 rounded-xl border border-brand-border bg-brand-surface px-4 py-2 text-xs font-semibold text-brand-text hover:border-brand-primary"
          >
            <Download className="h-4 w-4 text-brand-primary" />
            <span>Export All Events (JSON)</span>
          </button>

          <button
            onClick={handleResetData}
            className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/20"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Restore Demo Celebrations</span>
          </button>
        </div>
      </div>
    </div>
  );
};
