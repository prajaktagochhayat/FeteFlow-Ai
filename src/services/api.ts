import { EventPlan, EventWizardInput, AppSettings, BudgetAllocationItem, TimelineMilestone } from '../types';

const API_BASE = '/api';

export class ApiService {
  private static async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `Request failed with status ${res.status}`);
    }
    return res.json();
  }

  // Health
  public static async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return this.handleResponse<{ status: string; ai: any }>(res);
  }

  // Events
  public static async getEvents(): Promise<EventPlan[]> {
    const res = await fetch(`${API_BASE}/events`);
    return this.handleResponse<EventPlan[]>(res);
  }

  public static async getEvent(id: string): Promise<EventPlan> {
    const res = await fetch(`${API_BASE}/events/${id}`);
    return this.handleResponse<EventPlan>(res);
  }

  public static async createEvent(event: EventPlan): Promise<EventPlan> {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    return this.handleResponse<EventPlan>(res);
  }

  public static async updateEvent(id: string, updates: Partial<EventPlan>): Promise<EventPlan> {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return this.handleResponse<EventPlan>(res);
  }

  public static async deleteEvent(id: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'DELETE',
    });
    return this.handleResponse<{ success: boolean; id: string }>(res);
  }

  // AI Operations
  public static async generatePlan(input: EventWizardInput): Promise<{ plan: EventPlan; provider: 'gemini' | 'fallback' }> {
    const res = await fetch(`${API_BASE}/ai/generate-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return this.handleResponse<{ plan: EventPlan; provider: 'gemini' | 'fallback' }>(res);
  }

  public static async chat(eventId: string, message: string, history: Array<{ role: 'user' | 'assistant'; content: string }> = []) {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, message, history }),
    });
    return this.handleResponse<{ response: string; provider: 'gemini' | 'fallback' }>(res);
  }

  public static async optimizeBudget(eventId: string, instruction: string) {
    const res = await fetch(`${API_BASE}/ai/optimize-budget`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, instruction }),
    });
    return this.handleResponse<{ newAllocations: BudgetAllocationItem[]; explanation: string; provider: 'gemini' | 'fallback' }>(res);
  }

  public static async generateVendorBrief(eventId: string, category: string) {
    const res = await fetch(`${API_BASE}/ai/vendor-brief`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, category }),
    });
    return this.handleResponse<{ briefMarkdown: string; questionsToAsk: string[]; estimatedRange: string; provider: 'gemini' | 'fallback' }>(res);
  }

  public static async getTimelineRecovery(eventId: string) {
    const res = await fetch(`${API_BASE}/ai/timeline-recovery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId }),
    });
    return this.handleResponse<{ recoveryActions: string[]; updatedTimeline: TimelineMilestone[]; provider: 'gemini' | 'fallback' }>(res);
  }

  public static async generateInvitations(eventId: string) {
    const res = await fetch(`${API_BASE}/ai/invitations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId }),
    });
    return this.handleResponse<{ formal: string; playful: string; elegant: string; minimal: string; provider: 'gemini' | 'fallback' }>(res);
  }

  public static async getExecutiveSummary(eventId: string) {
    const res = await fetch(`${API_BASE}/ai/executive-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId }),
    });
    return this.handleResponse<{ summary: string; topPriorities: string[]; primaryRisks: string[]; provider: 'gemini' | 'fallback' }>(res);
  }

  // Settings
  public static async getSettings(): Promise<AppSettings> {
    const res = await fetch(`${API_BASE}/settings`);
    return this.handleResponse<AppSettings>(res);
  }

  public static async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return this.handleResponse<AppSettings>(res);
  }

  public static async resetData(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/settings/reset`, {
      method: 'POST',
    });
    return this.handleResponse<{ success: boolean; message: string }>(res);
  }
}
