import { EventPlan, EventWizardInput, AppSettings, BudgetAllocationItem, TimelineMilestone } from '../types';
import { CelebrationDataService } from './supabase';
import { clientAiService } from './aiService';

const API_BASE = '/api';

function getCurrentUserId(): string {
  try {
    const raw = localStorage.getItem('feteflow_active_user_session');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.id) return parsed.id;
    }
  } catch {}
  return 'guest';
}

function isStaticHosting(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host.includes('web.app') || host.includes('firebaseapp.com') || host !== 'localhost';
}

export class ApiService {
  private static async handleResponse<T>(res: Response): Promise<T> {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      throw new Error('Static host returned HTML instead of JSON');
    }
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `Request failed with status ${res.status}`);
    }
    return res.json();
  }

  // Health
  public static async getHealth() {
    if (isStaticHosting()) {
      return { status: 'ok', ai: clientAiService.getStatus() };
    }
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await this.handleResponse<{ status: string; ai: any }>(res);
    } catch {
      return { status: 'ok', ai: clientAiService.getStatus() };
    }
  }

  // Events (User Isolated via Supabase / Isolated Local Storage)
  public static async getEvents(userId?: string): Promise<EventPlan[]> {
    const uid = userId || getCurrentUserId();
    return CelebrationDataService.getCelebrations(uid);
  }

  public static async getEvent(id: string, userId?: string): Promise<EventPlan> {
    const uid = userId || getCurrentUserId();
    const events = await CelebrationDataService.getCelebrations(uid);
    const found = events.find(e => e.id === id);
    if (!found) throw new Error('Celebration not found');
    return found;
  }

  public static async createEvent(event: EventPlan, userId?: string): Promise<EventPlan> {
    const uid = userId || getCurrentUserId();
    return CelebrationDataService.createCelebration(uid, event);
  }

  public static async updateEvent(id: string, updates: Partial<EventPlan>, userId?: string): Promise<EventPlan> {
    const uid = userId || getCurrentUserId();
    return CelebrationDataService.updateCelebration(uid, id, updates);
  }

  public static async deleteEvent(id: string, userId?: string): Promise<{ success: boolean; id: string }> {
    const uid = userId || getCurrentUserId();
    await CelebrationDataService.deleteCelebration(uid, id);
    return { success: true, id };
  }

  // AI Operations (Resilient dual-engine: direct in-browser Gemini + local backend fallback)
  public static async generatePlan(input: EventWizardInput): Promise<{ plan: EventPlan; provider: 'gemini' | 'fallback' }> {
    if (isStaticHosting()) {
      return clientAiService.generateFullEventPlan(input);
    }

    try {
      const res = await fetch(`${API_BASE}/ai/generate-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      return await this.handleResponse<{ plan: EventPlan; provider: 'gemini' | 'fallback' }>(res);
    } catch (err) {
      console.warn('Backend route unavailable, switching to in-browser GenAI:', err);
      return clientAiService.generateFullEventPlan(input);
    }
  }

  public static async chat(
    eventId: string,
    message: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
    event?: EventPlan
  ) {
    if (isStaticHosting() && event) {
      return clientAiService.chatWithPlanner(event, history, message);
    }

    try {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, message, history, event }),
      });
      return await this.handleResponse<{ response: string; provider: 'gemini' | 'fallback' }>(res);
    } catch (err) {
      console.warn('Backend route unavailable, switching to in-browser GenAI:', err);
      if (event) {
        return clientAiService.chatWithPlanner(event, history, message);
      }
      throw err;
    }
  }

  public static async optimizeBudget(eventId: string, instruction: string, event?: EventPlan) {
    if (isStaticHosting() && event) {
      return clientAiService.optimizeBudget(event, instruction);
    }

    try {
      const res = await fetch(`${API_BASE}/ai/optimize-budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, instruction, event }),
      });
      return await this.handleResponse<{ newAllocations: BudgetAllocationItem[]; explanation: string; provider: 'gemini' | 'fallback' }>(res);
    } catch (err) {
      console.warn('Backend route unavailable, switching to in-browser GenAI:', err);
      if (event) {
        return clientAiService.optimizeBudget(event, instruction);
      }
      throw err;
    }
  }

  public static async generateVendorBrief(eventId: string, category: string, event?: EventPlan) {
    if (isStaticHosting() && event) {
      return clientAiService.generateVendorBrief(event, category);
    }

    try {
      const res = await fetch(`${API_BASE}/ai/vendor-brief`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, category, event }),
      });
      return await this.handleResponse<{ briefMarkdown: string; questionsToAsk: string[]; estimatedRange: string; provider: 'gemini' | 'fallback' }>(res);
    } catch (err) {
      console.warn('Backend route unavailable, switching to in-browser GenAI:', err);
      if (event) {
        return clientAiService.generateVendorBrief(event, category);
      }
      throw err;
    }
  }

  public static async getTimelineRecovery(eventId: string, event?: EventPlan) {
    if (isStaticHosting() && event) {
      const overdue = event.timeline.filter(t => !t.completed && new Date(t.dueDate) < new Date());
      return clientAiService.generateTimelineRecovery(event, overdue);
    }

    try {
      const res = await fetch(`${API_BASE}/ai/timeline-recovery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, event }),
      });
      return await this.handleResponse<{ recoveryActions: string[]; updatedTimeline: TimelineMilestone[]; provider: 'gemini' | 'fallback' }>(res);
    } catch (err) {
      console.warn('Backend route unavailable, switching to in-browser GenAI:', err);
      if (event) {
        const overdue = event.timeline.filter(t => !t.completed && new Date(t.dueDate) < new Date());
        return clientAiService.generateTimelineRecovery(event, overdue);
      }
      throw err;
    }
  }

  public static async generateInvitations(eventId: string, event?: EventPlan) {
    if (isStaticHosting() && event) {
      return clientAiService.generateInvitationCopy(event);
    }

    try {
      const res = await fetch(`${API_BASE}/ai/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, event }),
      });
      return await this.handleResponse<{ formal: string; playful: string; elegant: string; minimal: string; provider: 'gemini' | 'fallback' }>(res);
    } catch (err) {
      console.warn('Backend route unavailable, switching to in-browser GenAI:', err);
      if (event) {
        return clientAiService.generateInvitationCopy(event);
      }
      throw err;
    }
  }

  public static async getExecutiveSummary(eventId: string, event?: EventPlan) {
    if (isStaticHosting() && event) {
      return clientAiService.generateExecutiveSummary(event);
    }

    try {
      const res = await fetch(`${API_BASE}/ai/executive-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, event }),
      });
      return await this.handleResponse<{ summary: string; topPriorities: string[]; primaryRisks: string[]; provider: 'gemini' | 'fallback' }>(res);
    } catch (err) {
      console.warn('Backend route unavailable, switching to in-browser GenAI:', err);
      if (event) {
        return clientAiService.generateExecutiveSummary(event);
      }
      throw err;
    }
  }

  // Settings
  public static async getSettings(): Promise<AppSettings> {
    const DEPRECATED = new Set(['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']);
    if (isStaticHosting()) {
      try {
        const saved = localStorage.getItem('feteflow_app_settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.geminiModel && DEPRECATED.has(parsed.geminiModel)) {
            parsed.geminiModel = 'gemini-flash-lite-latest';
          }
          return parsed;
        }
      } catch {}
      return {
        geminiApiKey: '',
        geminiModel: 'gemini-flash-lite-latest',
        defaultCurrency: 'INR',
        theme: 'system',
        reducedMotion: false,
      };
    }

    try {
      const res = await fetch(`${API_BASE}/settings`);
      const s = await this.handleResponse<AppSettings>(res);
      if (s.geminiModel && DEPRECATED.has(s.geminiModel)) {
        s.geminiModel = 'gemini-flash-lite-latest';
      }
      return s;
    } catch {
      return {
        geminiApiKey: '',
        geminiModel: 'gemini-flash-lite-latest',
        defaultCurrency: 'INR',
        theme: 'system',
        reducedMotion: false,
      };
    }
  }

  public static async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    if (isStaticHosting()) {
      const current = await this.getSettings();
      const merged = { ...current, ...settings };
      localStorage.setItem('feteflow_app_settings', JSON.stringify(merged));
      return merged;
    }

    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      return await this.handleResponse<AppSettings>(res);
    } catch {
      const current = await this.getSettings();
      const merged = { ...current, ...settings };
      localStorage.setItem('feteflow_app_settings', JSON.stringify(merged));
      return merged;
    }
  }

  public static async resetData(): Promise<void> {
    if (isStaticHosting()) {
      return;
    }
    try {
      await fetch(`${API_BASE}/settings/reset`, { method: 'POST' });
    } catch {}
  }
}
