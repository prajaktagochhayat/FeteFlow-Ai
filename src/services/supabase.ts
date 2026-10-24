import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EventPlan } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Checks if Supabase credentials are provided in the environment
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20
);

/**
 * Supabase client instance (or null in local fallback mode)
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to convert database row (snake_case) to client model (camelCase)
function mapRowToEventPlan(row: any): EventPlan {
  return {
    id: row.id,
    name: row.name,
    eventType: row.event_type,
    date: row.date,
    location: row.location || '',
    guestCount: row.guest_count || 1,
    setting: row.setting || 'undecided',
    duration: row.duration || '1 Day',
    priorities: row.priorities || [],
    atmosphereVision: row.atmosphere_vision || '',
    eventConcept: row.event_concept || {
      title: 'Celebration Vision',
      description: '',
      theme: 'Custom',
      style: 'Modern',
      colorPalette: ['#7655E8', '#FF7C91'],
      creativeDirection: '',
    },
    budget: row.budget || {
      currency: 'INR',
      totalBudget: 0,
      allocations: [],
    },
    timeline: row.timeline || [],
    vendorChecklist: row.vendor_checklist || [],
    personalizedIdeas: row.personalized_ideas || [],
    risks: row.risks || [],
    nextActions: row.next_actions || [],
    guests: row.guests || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Helper to convert client model to database row
function mapEventPlanToRow(userId: string, plan: EventPlan): any {
  return {
    id: plan.id || 'evt_' + Date.now(),
    user_id: userId,
    name: plan.name,
    event_type: plan.eventType,
    date: plan.date,
    location: plan.location || '',
    guest_count: plan.guestCount || 1,
    setting: plan.setting || 'undecided',
    duration: plan.duration || '1 Day',
    priorities: plan.priorities || [],
    atmosphere_vision: plan.atmosphereVision || '',
    event_concept: plan.eventConcept,
    budget: plan.budget,
    timeline: plan.timeline || [],
    vendor_checklist: plan.vendorChecklist || [],
    personalized_ideas: plan.personalizedIdeas || [],
    risks: plan.risks || [],
    next_actions: plan.nextActions || [],
    guests: plan.guests || [],
  };
}

// Local Storage Multi-User Store Key
function getLocalStoreKey(userId: string): string {
  return `feteflow_events_user_${userId || 'guest'}`;
}

export class CelebrationDataService {
  /**
   * Retrieves all celebrations for the authenticated user
   */
  public static async getCelebrations(userId: string): Promise<EventPlan[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('celebrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase getCelebrations error:', error);
        throw new Error(error.message);
      }
      return (data || []).map(mapRowToEventPlan);
    }

    // Local Multi-User Storage Fallback
    try {
      const stored = localStorage.getItem(getLocalStoreKey(userId));
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Creates a new celebration associated with the user's account
   */
  public static async createCelebration(userId: string, plan: EventPlan): Promise<EventPlan> {
    const fullPlan: EventPlan = {
      ...plan,
      id: plan.id || 'evt_' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const row = mapEventPlanToRow(userId, fullPlan);
      const { data, error } = await supabase
        .from('celebrations')
        .insert([row])
        .select()
        .single();

      if (error) {
        console.error('Supabase createCelebration error:', error);
        throw new Error(error.message);
      }
      return mapRowToEventPlan(data);
    }

    // Local Storage Fallback
    const existing = await this.getCelebrations(userId);
    const updated = [fullPlan, ...existing];
    localStorage.setItem(getLocalStoreKey(userId), JSON.stringify(updated));
    return fullPlan;
  }

  /**
   * Updates an existing celebration
   */
  public static async updateCelebration(
    userId: string,
    id: string,
    updates: Partial<EventPlan>
  ): Promise<EventPlan> {
    if (isSupabaseConfigured && supabase) {
      const dbUpdates: any = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.eventType !== undefined) dbUpdates.event_type = updates.eventType;
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      if (updates.location !== undefined) dbUpdates.location = updates.location;
      if (updates.guestCount !== undefined) dbUpdates.guest_count = updates.guestCount;
      if (updates.setting !== undefined) dbUpdates.setting = updates.setting;
      if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
      if (updates.priorities !== undefined) dbUpdates.priorities = updates.priorities;
      if (updates.atmosphereVision !== undefined) dbUpdates.atmosphere_vision = updates.atmosphereVision;
      if (updates.eventConcept !== undefined) dbUpdates.event_concept = updates.eventConcept;
      if (updates.budget !== undefined) dbUpdates.budget = updates.budget;
      if (updates.timeline !== undefined) dbUpdates.timeline = updates.timeline;
      if (updates.vendorChecklist !== undefined) dbUpdates.vendor_checklist = updates.vendorChecklist;
      if (updates.personalizedIdeas !== undefined) dbUpdates.personalized_ideas = updates.personalizedIdeas;
      if (updates.risks !== undefined) dbUpdates.risks = updates.risks;
      if (updates.nextActions !== undefined) dbUpdates.next_actions = updates.nextActions;
      if (updates.guests !== undefined) dbUpdates.guests = updates.guests;

      const { data, error } = await supabase
        .from('celebrations')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase updateCelebration error:', error);
        throw new Error(error.message);
      }
      return mapRowToEventPlan(data);
    }

    // Local Storage Fallback
    const existing = await this.getCelebrations(userId);
    let target = existing.find(e => e.id === id);
    if (!target) {
      throw new Error('Celebration not found');
    }
    const merged: EventPlan = {
      ...target,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    const updatedList = existing.map(e => (e.id === id ? merged : e));
    localStorage.setItem(getLocalStoreKey(userId), JSON.stringify(updatedList));
    return merged;
  }

  /**
   * Deletes a celebration
   */
  public static async deleteCelebration(userId: string, id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('celebrations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase deleteCelebration error:', error);
        throw new Error(error.message);
      }
      return true;
    }

    // Local Storage Fallback
    const existing = await this.getCelebrations(userId);
    const filtered = existing.filter(e => e.id !== id);
    localStorage.setItem(getLocalStoreKey(userId), JSON.stringify(filtered));
    return true;
  }
}
