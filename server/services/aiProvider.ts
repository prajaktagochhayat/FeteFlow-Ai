import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  EventWizardInput,
  EventPlan,
  BudgetAllocationItem,
  TimelineMilestone,
  PersonalizedIdea,
  VendorChecklistItem
} from '../schemas/eventPlanSchema.js';

export interface AIProviderStatus {
  isConfigured: boolean;
  model: string;
  provider: 'gemini' | 'fallback';
}

function formatCurrency(amount: number, currency: string = 'INR'): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  const isINR = currency.toUpperCase() === 'INR' || currency === '₹';
  const symbol = isINR ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : `${currency} `;
  const locale = isINR ? 'en-IN' : 'en-US';
  return `${symbol}${Math.round(amount).toLocaleString(locale)}`;
}

export class EventPlanningService {
  private apiKey: string | null = null;
  private modelName: string = 'gemini-1.5-flash';
  private client: GoogleGenerativeAI | null = null;

  constructor() {
    this.refreshConfig();
  }

  public refreshConfig(newKey?: string, newModel?: string) {
    this.apiKey = newKey || process.env.GEMINI_API_KEY || null;
    this.modelName = newModel || process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    if (this.apiKey && this.apiKey.trim().length > 0) {
      try {
        this.client = new GoogleGenerativeAI(this.apiKey.trim());
      } catch (err) {
        console.error('Failed to initialize GoogleGenerativeAI client:', err);
        this.client = null;
      }
    } else {
      this.client = null;
    }
  }

  public getStatus(): AIProviderStatus {
    return {
      isConfigured: Boolean(this.client),
      model: this.modelName,
      provider: this.client ? 'gemini' : 'fallback',
    };
  }

  // FEATURE 1: Full Event Plan Generation
  public async generateFullEventPlan(input: EventWizardInput): Promise<{ plan: EventPlan; provider: 'gemini' | 'fallback' }> {
    if (this.client) {
      try {
        const prompt = `
You are FêteFlow AI, a world-class celebration architect and event producer.
Generate a structured, personalized, realistic event plan in valid JSON format matching this input:
Event Type: ${input.eventType}
Event Name: ${input.eventName}
Target Date: ${input.date}
Location: ${input.location || 'Local venue'}
Estimated Guests: ${input.guestCount}
Setting: ${input.setting}
Total Budget: ${input.currency} ${input.budgetAmount}
Style Preference: ${input.stylePreference || 'Tailored elegance'}
Color Preference: ${input.colorPreference || 'Harmonious celebration palette'}
Food Preference: ${input.foodPreference || 'Curated seasonal menu'}
Accessibility Needs: ${input.accessibilityNeeds || 'Universal accessible design'}
Key Priorities: ${(input.priorities || []).join(', ')}
Atmosphere Vision: ${input.atmosphereDescription || 'Warm, memorable and joyful'}

CRITICAL INSTRUCTIONS:
1. Return ONLY pure JSON without markdown backticks.
2. The total sum of budget allocations must equal approximately ${input.budgetAmount}.
3. Create realistic chronological milestones leading up to ${input.date}.
4. Provide customized vendor categories, tasks, and probing questions to ask.
5. Provide high-taste, non-generic creative ideas and proactive risk mitigations.

JSON Structure:
{
  "eventConcept": {
    "title": "Creative Title",
    "description": "Inspiring concept description",
    "theme": "Core theme name",
    "style": "Visual style",
    "colorPalette": ["#HEX1", "#HEX2", "#HEX3", "#HEX4", "#HEX5"],
    "creativeDirection": "Creative guidelines"
  },
  "budget": {
    "currency": "${input.currency}",
    "totalBudget": ${input.budgetAmount},
    "allocations": [
      { "category": "Venue & Ambiance", "amount": 0, "reason": "Explanation" }
    ]
  },
  "timeline": [
    { "title": "Milestone title", "description": "Details", "dueDate": "YYYY-MM-DD", "priority": "high", "category": "Planning" }
  ],
  "vendorChecklist": [
    { "category": "Venue", "tasks": ["Task 1"], "questionsToAsk": ["Question 1"] }
  ],
  "personalizedIdeas": [
    { "title": "Idea title", "description": "Idea description", "category": "Decor", "estimatedCost": 0, "reason": "Why it fits" }
  ],
  "risks": [
    { "description": "Risk detail", "mitigation": "Mitigation step" }
  ],
  "nextActions": [
    "Immediate step 1",
    "Immediate step 2"
  ]
}
`;

        const model = this.client.getGenerativeModel({
          model: this.modelName,
          generationConfig: { responseMimeType: 'application/json' },
        });

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = JSON.parse(text);

        const fullPlan: EventPlan = {
          id: 'evt_' + Date.now(),
          name: input.eventName,
          eventType: input.eventType,
          date: input.date,
          location: input.location || '',
          guestCount: input.guestCount,
          setting: input.setting || 'undecided',
          duration: input.duration || '1 Day',
          priorities: input.priorities || [],
          atmosphereVision: input.atmosphereDescription || '',
          eventConcept: parsed.eventConcept,
          budget: parsed.budget,
          timeline: (parsed.timeline || []).map((t: any, idx: number) => ({
            id: 'tml_' + (idx + 1),
            title: t.title,
            description: t.description || '',
            dueDate: t.dueDate,
            priority: t.priority || 'medium',
            category: t.category || 'Planning',
            completed: false,
          })),
          vendorChecklist: (parsed.vendorChecklist || []).map((v: any, idx: number) => ({
            id: 'vnd_' + (idx + 1),
            category: v.category,
            tasks: v.tasks || [],
            questionsToAsk: v.questionsToAsk || [],
            status: 'researching',
            notes: '',
            quotedAmount: 0,
          })),
          personalizedIdeas: (parsed.personalizedIdeas || []).map((idea: any, idx: number) => ({
            id: 'idea_' + (idx + 1),
            title: idea.title,
            description: idea.description,
            category: idea.category || 'Creative',
            estimatedCost: idea.estimatedCost || 0,
            reason: idea.reason || '',
            isFavorite: false,
          })),
          risks: parsed.risks || [],
          nextActions: parsed.nextActions || [],
          guests: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return { plan: fullPlan, provider: 'gemini' };
      } catch (err) {
        console.warn('Gemini plan generation failed or timed out, using fallback planner:', err);
      }
    }

    // High-fidelity fallback deterministic planner
    const plan = this.generateDeterministicPlan(input);
    return { plan, provider: 'fallback' };
  }

  // FEATURE 2: Conversational Planner
  public async chatWithPlanner(
    event: EventPlan,
    messageHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    newMessage: string
  ): Promise<{ response: string; provider: 'gemini' | 'fallback' }> {
    if (this.client) {
      try {
        const historyPrompt = messageHistory.slice(-4).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
        const prompt = `
You are FêteFlow AI, a trusted celebration planner assisting the user with their upcoming event:
Event Name: "${event.name}" (${event.eventType})
Date: ${event.date}
Location: ${event.location || 'Not specified'}
Guests: ${event.guestCount}
Budget: ${event.budget.currency} ${event.budget.totalBudget}
Concept: ${event.eventConcept.title} - ${event.eventConcept.description}

Recent Conversation:
${historyPrompt}

User Inquiry: ${newMessage}

Respond as an encouraging, creative, and pragmatic event specialist. Offer actionable advice, specific suggestions, and clear next steps. Keep response under 300 words.
`;

        const model = this.client.getGenerativeModel({ model: this.modelName });
        const result = await model.generateContent(prompt);
        return { response: result.response.text(), provider: 'gemini' };
      } catch (err) {
        console.warn('Gemini chat failed, using fallback:', err);
      }
    }

    const fallbackResponse = this.generateDeterministicChatResponse(event, newMessage);
    return { response: fallbackResponse, provider: 'fallback' };
  }

  // FEATURE 3: Budget Optimization
  public async optimizeBudget(
    event: EventPlan,
    instruction: string
  ): Promise<{ newAllocations: BudgetAllocationItem[]; explanation: string; provider: 'gemini' | 'fallback' }> {
    if (this.client) {
      try {
        const prompt = `
You are the FêteFlow AI Financial Strategist.
Current Budget: ${event.budget.currency} ${event.budget.totalBudget}
Current Allocations:
${JSON.stringify(event.budget.allocations, null, 2)}

User Instruction: "${instruction}"

Reallocate the budget categories to fulfill the user instruction while keeping the total budget exactly at ${event.budget.totalBudget}.
Return pure JSON with this structure:
{
  "explanation": "Concise summary of rationale behind the reallocations",
  "newAllocations": [
    { "category": "Category Name", "amount": 0, "reason": "Change rationale", "actualCost": 0 }
  ]
}
`;
        const model = this.client.getGenerativeModel({
          model: this.modelName,
          generationConfig: { responseMimeType: 'application/json' },
        });
        const result = await model.generateContent(prompt);
        const parsed = JSON.parse(result.response.text());
        if (parsed.newAllocations && Array.isArray(parsed.newAllocations)) {
          return {
            newAllocations: parsed.newAllocations,
            explanation: parsed.explanation || 'Budget optimized according to your constraints.',
            provider: 'gemini',
          };
        }
      } catch (err) {
        console.warn('Gemini budget optimization failed, using fallback:', err);
      }
    }

    return this.generateDeterministicBudgetOptimization(event, instruction);
  }

  // FEATURE 4: Timeline Milestone Schedule & Recovery
  public async generateTimelineRecovery(
    event: EventPlan,
    overdueTasks: TimelineMilestone[]
  ): Promise<{ recoveryActions: string[]; updatedTimeline: TimelineMilestone[]; provider: 'gemini' | 'fallback' }> {
    if (this.client && overdueTasks.length > 0) {
      try {
        const prompt = `
Event "${event.name}" is on ${event.date}.
The following milestones are overdue or urgent:
${JSON.stringify(overdueTasks, null, 2)}

Provide a recovery action plan to regain momentum without jeopardizing the event date.
Return pure JSON:
{
  "recoveryActions": ["Action 1", "Action 2", "Action 3"],
  "rescheduledMilestones": [
    { "title": "Milestone Title", "adjustedDueDate": "YYYY-MM-DD", "priority": "high" }
  ]
}
`;
        const model = this.client.getGenerativeModel({
          model: this.modelName,
          generationConfig: { responseMimeType: 'application/json' },
        });
        const result = await model.generateContent(prompt);
        const parsed = JSON.parse(result.response.text());
        const recoveryActions = parsed.recoveryActions || [];
        const updatedTimeline = event.timeline.map(t => {
          const match = (parsed.rescheduledMilestones || []).find((r: any) => r.title.toLowerCase() === t.title.toLowerCase());
          return match ? { ...t, dueDate: match.adjustedDueDate, priority: match.priority || t.priority } : t;
        });
        return { recoveryActions, updatedTimeline, provider: 'gemini' };
      } catch (err) {
        console.warn('Gemini timeline recovery failed:', err);
      }
    }

    const today = new Date().toISOString().split('T')[0];
    const updated = event.timeline.map(t => {
      if (overdueTasks.some(o => o.title === t.title)) {
        return { ...t, dueDate: today, priority: 'high' as const };
      }
      return t;
    });
    return {
      recoveryActions: [
        'Consolidate outstanding vendor inquiries into a single outreach sprint.',
        'Delegate secondary aesthetic decisions to co-hosts or coordinators.',
        'Lock in non-negotiable venue and catering milestones immediately.',
      ],
      updatedTimeline: updated,
      provider: 'fallback',
    };
  }

  // FEATURE 6: Vendor Brief Generator
  public async generateVendorBrief(
    event: EventPlan,
    category: string
  ): Promise<{ briefMarkdown: string; questionsToAsk: string[]; estimatedRange: string; provider: 'gemini' | 'fallback' }> {
    if (this.client) {
      try {
        const prompt = `
Generate a formal vendor brief / Request for Quote for "${category}" for the celebration:
Event: ${event.name} (${event.eventType})
Date: ${event.date}
Location: ${event.location || 'Local area'}
Guest Count: ${event.guestCount}
Creative Vision: ${event.eventConcept.title} - ${event.eventConcept.description}
Color Palette: ${event.eventConcept.colorPalette.join(', ')}
Budget Available for ${category}: ${event.budget.currency} ${
          event.budget.allocations.find(a => a.category.toLowerCase().includes(category.toLowerCase()))?.amount || 'To Be Negotiated'
        }

Return pure JSON:
{
  "briefMarkdown": "Markdown formatted vendor brief outlining expectations, deliverables, and aesthetic criteria",
  "questionsToAsk": ["Probing question 1", "Question 2", "Question 3"],
  "estimatedRange": "e.g. ₹50,000 - ₹80,000"
}
`;
        const model = this.client.getGenerativeModel({
          model: this.modelName,
          generationConfig: { responseMimeType: 'application/json' },
        });
        const result = await model.generateContent(prompt);
        const parsed = JSON.parse(result.response.text());
        return {
          briefMarkdown: parsed.briefMarkdown || `# Vendor Brief: ${category}\n\n**Event:** ${event.name}`,
          questionsToAsk: parsed.questionsToAsk || ['What is your cancellation and reschedule policy?', 'Are travel and setup fees included?'],
          estimatedRange: parsed.estimatedRange || `${event.budget.currency} Market Average`,
          provider: 'gemini',
        };
      } catch (err) {
        console.warn('Gemini vendor brief failed, using fallback:', err);
      }
    }

    return this.generateDeterministicVendorBrief(event, category);
  }

  // FEATURE 9: Invitation Copy Generator
  public async generateInvitationCopy(
    event: EventPlan
  ): Promise<{ formal: string; playful: string; elegant: string; minimal: string; provider: 'gemini' | 'fallback' }> {
    if (this.client) {
      try {
        const prompt = `
Generate 4 distinct celebration invitation copies for:
Event: ${event.name}
Type: ${event.eventType}
Date: ${event.date}
Location: ${event.location || 'The Celebration Venue'}
Host Vision: ${event.eventConcept.description}

Provide JSON:
{
  "formal": "Classic, dignified wording",
  "playful": "Fun, warm, energetic wording with celebratory touch",
  "elegant": "Sophisticated, poetic and timeless wording",
  "minimal": "Clean, modern, essential wording"
}
`;
        const model = this.client.getGenerativeModel({
          model: this.modelName,
          generationConfig: { responseMimeType: 'application/json' },
        });
        const result = await model.generateContent(prompt);
        const parsed = JSON.parse(result.response.text());
        return {
          formal: parsed.formal || `We cordially request your presence at ${event.name} on ${event.date}.`,
          playful: parsed.playful || `Get ready to celebrate! Join us for ${event.name} on ${event.date}!`,
          elegant: parsed.elegant || `Join us under the stars as we honor ${event.name} on ${event.date}.`,
          minimal: parsed.minimal || `${event.name}\n${event.date} · ${event.location || 'Details to follow'}\nRSVP required.`,
          provider: 'gemini',
        };
      } catch (err) {
        console.warn('Gemini invitation copy failed:', err);
      }
    }

    return {
      formal: `You are cordially invited to celebrate ${event.name}.\nDate: ${event.date}\nLocation: ${event.location || 'To be announced'}\nKindly RSVP by your earliest convenience.`,
      playful: `Confetti ready? Let's make some magic! 🎉\nJoin us for ${event.name} on ${event.date}.\nGreat food, music, and unforgettable memories guaranteed!`,
      elegant: `Together with joy in our hearts, we invite you to share in the magic of ${event.name}.\n${event.date} · ${event.location || 'A Beautiful Setting'}\nDress: Celebration Cocktail`,
      minimal: `${event.name.toUpperCase()}\n${event.date} · ${event.location || 'Location upon RSVP'}\nRSVP via FêteFlow`,
      provider: 'fallback',
    };
  }

  // FEATURE 10: Event Executive Summary
  public async generateExecutiveSummary(
    event: EventPlan
  ): Promise<{ summary: string; topPriorities: string[]; primaryRisks: string[]; provider: 'gemini' | 'fallback' }> {
    const totalSpent = event.budget.allocations.reduce((acc, a) => acc + (a.actualCost || 0), 0);
    const completedTasks = event.timeline.filter(t => t.completed).length;
    const pendingTasks = event.timeline.length - completedTasks;

    const summary = `${event.name} is scheduled for ${event.date} with an anticipated ${event.guestCount} guests. The aesthetic direction centers on "${event.eventConcept.title}" with a target budget of ${formatCurrency(event.budget.totalBudget, event.budget.currency)} (${totalSpent > 0 ? `${formatCurrency(totalSpent, event.budget.currency)} spent to date` : 'no actual expenses logged yet'}). Currently, ${completedTasks} of ${event.timeline.length} milestones are completed with ${pendingTasks} remaining.`;

    const topPriorities = event.timeline
      .filter(t => !t.completed)
      .slice(0, 3)
      .map(t => `${t.title} (Due: ${t.dueDate})`);

    const primaryRisks = (event.risks || []).slice(0, 3).map(r => `${r.description} — ${r.mitigation}`);

    return {
      summary,
      topPriorities: topPriorities.length > 0 ? topPriorities : ['All logged milestones are currently on schedule.'],
      primaryRisks: primaryRisks.length > 0 ? primaryRisks : ['Verify vendor contracts for weather contingencies.'],
      provider: 'fallback',
    };
  }

  // Deterministic Fallback Logic
  private generateDeterministicPlan(input: EventWizardInput): EventPlan {
    const isWedding = input.eventType === 'wedding';
    const isBirthday = input.eventType === 'birthday';
    const isCommunity = input.eventType === 'community';

    const colorPalettes: Record<string, string[]> = {
      wedding: ['#7655E8', '#EDE6FF', '#FF7C91', '#FFFCF7', '#C5B4FF'],
      birthday: ['#FF7C91', '#FFB800', '#7655E8', '#00D2D3', '#F8F5FF'],
      community: ['#10B981', '#7655E8', '#F59E0B', '#3B82F6', '#FFFCF7'],
      default: ['#7655E8', '#FF7C91', '#5535B8', '#EDE6FF', '#241D35'],
    };

    const palette = isWedding
      ? colorPalettes.wedding
      : isBirthday
      ? colorPalettes.birthday
      : isCommunity
      ? colorPalettes.community
      : colorPalettes.default;

    const total = input.budgetAmount || 100000;
    const currency = input.currency || 'INR';

    const allocations: BudgetAllocationItem[] = isWedding
      ? [
          { category: 'Venue & Architecture', amount: Math.round(total * 0.35), reason: 'Anchor space, seating and ambient lighting', actualCost: 0 },
          { category: 'Catering & Beverages', amount: Math.round(total * 0.30), reason: 'Multi-course menu, celebratory toast and bar service', actualCost: 0 },
          { category: 'Photography & Cinema', amount: Math.round(total * 0.15), reason: 'Full day documentary coverage and keepsake portraits', actualCost: 0 },
          { category: 'Floral & Atmosphere Styling', amount: Math.round(total * 0.12), reason: 'Botanical installations, tablescapes, and focal arch', actualCost: 0 },
          { category: 'Music & Experience Design', amount: Math.round(total * 0.08), reason: 'Live acoustic ceremony, sound engineering, and reception DJ', actualCost: 0 },
        ]
      : isBirthday
      ? [
          { category: 'Venue & Experience Space', amount: Math.round(total * 0.28), reason: 'Private party lounge or outdoor venue', actualCost: 0 },
          { category: 'Custom Cake & Gourmet Bites', amount: Math.round(total * 0.32), reason: 'Sculptural tiered cake and interactive culinary stations', actualCost: 0 },
          { category: 'Bespoke Decor & Balloon Art', amount: Math.round(total * 0.20), reason: 'High-impact entrance balloon garland and backdrop', actualCost: 0 },
          { category: 'Entertainment & DJ', amount: Math.round(total * 0.12), reason: 'Music curation and interactive celebration games', actualCost: 0 },
          { category: 'Keepsakes & Photography', amount: Math.round(total * 0.08), reason: 'Photo moment setup and curated guest favors', actualCost: 0 },
        ]
      : [
          { category: 'Public Space Permitting & Setup', amount: Math.round(total * 0.25), reason: 'Park/plaza reservation, safety barriers, and power', actualCost: 0 },
          { category: 'Community Refreshments & Snacks', amount: Math.round(total * 0.35), reason: 'Local food truck tokens, hydration stations and snacks', actualCost: 0 },
          { category: 'Sound, Stage & Lighting', amount: Math.round(total * 0.22), reason: 'PA system, wireless microphones and solar lanterns', actualCost: 0 },
          { category: 'Workshops & Activities', amount: Math.round(total * 0.18), reason: 'Interactive art supplies, games, and welcome booth', actualCost: 0 },
        ];

    const targetDate = new Date(input.date);
    const msInDay = 86400000;
    const dMinus60 = new Date(targetDate.getTime() - 60 * msInDay).toISOString().split('T')[0];
    const dMinus45 = new Date(targetDate.getTime() - 45 * msInDay).toISOString().split('T')[0];
    const dMinus30 = new Date(targetDate.getTime() - 30 * msInDay).toISOString().split('T')[0];
    const dMinus14 = new Date(targetDate.getTime() - 14 * msInDay).toISOString().split('T')[0];
    const dMinus7 = new Date(targetDate.getTime() - 7 * msInDay).toISOString().split('T')[0];
    const dMinus1 = new Date(targetDate.getTime() - 1 * msInDay).toISOString().split('T')[0];

    const timeline: TimelineMilestone[] = [
      { id: 'tml_1', title: 'Lock Primary Venue & Contracts', description: 'Confirm deposit and date exclusivity', dueDate: dMinus60, priority: 'high', category: 'Venue', completed: false },
      { id: 'tml_2', title: 'Curate Menu & Beverage Tastings', description: 'Finalize dietary alternatives and service style', dueDate: dMinus45, priority: 'high', category: 'Catering', completed: false },
      { id: 'tml_3', title: 'Send Digital Invitations & Collect RSVPs', description: 'Distribute invitation copy and setup response tracking', dueDate: dMinus30, priority: 'medium', category: 'Guests', completed: false },
      { id: 'tml_4', title: 'Atmosphere & Decor Concept Finalization', description: 'Review floral swatches, balloon arrangements, and lighting', dueDate: dMinus14, priority: 'medium', category: 'Decor', completed: false },
      { id: 'tml_5', title: 'Final Headcount & Vendor Brief Dispatch', description: 'Deliver final counts and schedule run-sheet to all vendors', dueDate: dMinus7, priority: 'high', category: 'Operations', completed: false },
      { id: 'tml_6', title: 'On-Site Walkthrough & Sound Check', description: 'Verify power points, arrival signage, and rain contingencies', dueDate: dMinus1, priority: 'high', category: 'Rehearsal', completed: false },
    ];

    const vendorChecklist: VendorChecklistItem[] = [
      {
        id: 'vnd_1',
        category: 'Venue & Location',
        tasks: ['Inquire about load-in time restrictions', 'Confirm sound curfew ordinances', 'Review inclement weather fallback spaces'],
        questionsToAsk: ['Are outside caterers permitted?', 'What security deposits are required for cleanup?'],
        status: 'researching',
        notes: '',
        quotedAmount: 0,
      },
      {
        id: 'vnd_2',
        category: 'Catering & Dining',
        tasks: ['Request custom tasting menu', 'Accommodate gluten-free and vegan guests', 'Confirm bar licensing and glassware provision'],
        questionsToAsk: ['Do you provide staffing and tableware?', 'How are leftover portions managed?'],
        status: 'researching',
        notes: '',
        quotedAmount: 0,
      },
      {
        id: 'vnd_3',
        category: 'Atmosphere & Decor',
        tasks: ['Measure ceiling height for balloon or floral installations', 'Select linen swatches matching palette', 'Confirm candle open-flame guidelines'],
        questionsToAsk: ['Do you handle post-event teardown?', 'Can elements be repurposed between ceremony and reception?'],
        status: 'researching',
        notes: '',
        quotedAmount: 0,
      },
      {
        id: 'vnd_4',
        category: 'Photography & Cinema',
        tasks: ['Prepare family and friend shot list', 'Confirm golden hour outdoor portrait timing', 'Review high-resolution delivery rights'],
        questionsToAsk: ['How soon are sneak peek photos available?', 'Do you have backup camera bodies and audio recorders?'],
        status: 'researching',
        notes: '',
        quotedAmount: 0,
      },
    ];

    const personalizedIdeas: PersonalizedIdea[] = isWedding
      ? [
          { id: 'idea_1', title: 'Vintage Audio Guestbook Station', description: 'A charming retro rotary telephone where guests lift the receiver to record heartfelt audio voice memos.', category: 'Guest Experience', estimatedCost: Math.round(total * 0.03), reason: 'Creates an emotional auditory keepsake far more vibrant than a paper registry book.', isFavorite: true },
          { id: 'idea_2', title: 'Golden Hour Champagne & Mocktail Tower', description: 'Cascading champagne coupe tower paired with botanical herbal mocktails during transition to sunset.', category: 'Beverage & Moments', estimatedCost: Math.round(total * 0.04), reason: 'High visual celebration impact right before speeches.', isFavorite: false },
          { id: 'idea_3', title: 'Warm Velvet Table Accents', description: 'Tying menus with raw-edged velvet ribbons in violet and coral to anchor the table styling.', category: 'Decor', estimatedCost: Math.round(total * 0.02), reason: 'Tactile luxury on a modest decor budget.', isFavorite: true },
        ]
      : isBirthday
      ? [
          { id: 'idea_1', title: 'Sculptural Metallic Balloon Archway', description: 'Organic asymmetrical arch mixing matte lilac, rose gold chrome, and clear confetti spheres.', category: 'Visual Statement', estimatedCost: Math.round(total * 0.05), reason: 'Instant photogenic centerpiece for arrival moments.', isFavorite: true },
          { id: 'idea_2', title: 'Interactive Midnight Dessert Wall', description: 'A backlit peg wall featuring artisanal glazed treats and personalized congratulatory notes.', category: 'Culinary Experience', estimatedCost: Math.round(total * 0.04), reason: 'Engaging sweet-treat station that delights guests late in the evening.', isFavorite: false },
          { id: 'idea_3', title: 'Personalized Celebration Trivia Duel', description: 'Curated 10-question mobile trivia about the guest of honor with playful prize pins.', category: 'Entertainment', estimatedCost: Math.round(total * 0.01), reason: 'Breaks the ice and connects disparate friend groups instantly.', isFavorite: true },
        ]
      : [
          { id: 'idea_1', title: 'Collaborative Community Canvas Mural', description: 'A large wooden triptych where attendees paint a section guided by color-coded numbered outlines.', category: 'Community Art', estimatedCost: Math.round(total * 0.04), reason: 'Creates a permanent, communal art installation for the community center.', isFavorite: true },
          { id: 'idea_2', title: 'Acoustic Lawn Living Room', description: 'Vintage rugs, beanbags, and low pallet tables creating warm intimate conversation nooks.', category: 'Ambiance', estimatedCost: Math.round(total * 0.05), reason: 'Makes large public open spaces feel cozy and welcoming.', isFavorite: true },
          { id: 'idea_3', title: 'Local Artisan Showcase Passport', description: 'Stamp cards encouraging attendees to visit and discover 6 neighborhood makers and vendors.', category: 'Engagement', estimatedCost: Math.round(total * 0.02), reason: 'Boosts neighborhood entrepreneur visibility effortlessly.', isFavorite: false },
        ];

    const risks = [
      { description: 'Potential seasonal weather changes for outdoor elements', mitigation: 'Reserve clear-top canopy or confirm indoor alternate salon 72 hours prior.' },
      { description: 'Guest RSVP attrition or unnotified plus-ones', mitigation: 'Set dietary buffer of 5% with caterer and send digital SMS reminder 5 days ahead.' },
      { description: 'Peak hour vendor arrival congestion', mitigation: 'Stagger vendor load-in windows in 30-minute intervals with a designated coordinator.' },
    ];

    return {
      id: 'evt_' + Date.now(),
      name: input.eventName,
      eventType: input.eventType,
      date: input.date,
      location: input.location || 'Bespoke Celebration Space',
      guestCount: input.guestCount,
      setting: input.setting || 'undecided',
      duration: input.duration || '1 Day',
      priorities: input.priorities || [],
      atmosphereVision: input.atmosphereDescription || 'Warm, unforgettable celebration filled with joy and connection.',
      eventConcept: {
        title: isWedding ? 'Ethereal Botanical Elegance' : isBirthday ? 'Glow & Revelry Celebration' : 'Unity in Harmony Fair',
        description: `A thoughtfully curated ${input.eventType} experience combining refined aesthetics with heartfelt hospitality, tailored for ${input.guestCount} cherished guests.`,
        theme: isWedding ? 'Modern Romanticism' : isBirthday ? 'Midnight Celebration & Confetti' : 'Vibrant Community Gathering',
        style: input.stylePreference || 'Contemporary Chic',
        colorPalette: palette,
        creativeDirection: 'Balance bold focal moments with intimate seating nooks. Ensure warm lighting, organic floral textures, and seamless pacing from welcome to departure.',
      },
      budget: {
        currency,
        totalBudget: total,
        allocations,
      },
      timeline,
      vendorChecklist,
      personalizedIdeas,
      risks,
      nextActions: [
        'Review and lock initial venue deposits',
        'Finalize catering menu tasting schedule',
        'Share personalized invitation copy with co-hosts',
      ],
      guests: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  private generateDeterministicChatResponse(event: EventPlan, query: string): string {
    const q = query.toLowerCase();
    if (q.includes('budget') || q.includes('cost') || q.includes('money')) {
      const topCat = event.budget.allocations[0];
      return `For "${event.name}", your primary budget allocation is currently ${topCat?.category || 'Venue'} at ${topCat ? formatCurrency(topCat.amount, event.budget.currency) : '₹0'}. If you wish to optimize spending, consider adjusting decor or entertainment allocations without touching core guest dining!`;
    }
    if (q.includes('decor') || q.includes('theme') || q.includes('color')) {
      return `Your current creative theme is "${event.eventConcept.title}" using a palette of ${event.eventConcept.colorPalette.join(', ')}. For an elevated visual touch, incorporate subtle ambient lighting, textured fabrics, and asymmetrical flower/balloon clusters that echo this color story.`;
    }
    if (q.includes('timeline') || q.includes('when') || q.includes('date')) {
      return `Your target celebration date is ${event.date}. You currently have ${event.timeline.length} scheduled milestones. The immediate priority is locking in vendors at least 30 days ahead to guarantee preferred rates and dates.`;
    }
    if (q.includes('vendor') || q.includes('cater') || q.includes('photographer')) {
      return `When interviewing vendors for ${event.name}, always ask: 1) What is their backup plan in case of equipment failure or illness? 2) Are setup and breakdown hours included in the quotation? You can use our Vendor Hub to generate formal briefs!`;
    }
    return `That's a wonderful consideration for ${event.name}! As your celebration planner, I suggest aligning this with your ${event.guestCount} guests' arrival experience so everyone feels immediately welcomed. Would you like me to draft specific tasks or budget estimates for this?`;
  }

  private generateDeterministicBudgetOptimization(
    event: EventPlan,
    instruction: string
  ): { newAllocations: BudgetAllocationItem[]; explanation: string; provider: 'gemini' | 'fallback' } {
    const newAllocations = event.budget.allocations.map(a => ({ ...a }));
    const lower = instruction.toLowerCase();

    if (lower.includes('decor') && (lower.includes('reduce') || lower.includes('cut') || lower.includes('decrease'))) {
      const decor = newAllocations.find(a => a.category.toLowerCase().includes('decor') || a.category.toLowerCase().includes('floral'));
      const venue = newAllocations.find(a => a.category.toLowerCase().includes('venue'));
      if (decor && venue) {
        const cut = Math.round(decor.amount * 0.15);
        decor.amount -= cut;
        decor.reason = `${decor.reason} (Reduced by 15% with optimized seasonal alternatives)`;
        venue.amount += cut;
        venue.reason = `${venue.reason} (Reallocated surplus from decor)`;
        return {
          newAllocations,
          explanation: `Reduced decor by 15% (-${formatCurrency(cut, event.budget.currency)}) by swapping exotic florals for high-impact sculptural lighting and seasonal greenery, maintaining budget balance.`,
          provider: 'fallback',
        };
      }
    }

    if (newAllocations.length >= 2) {
      newAllocations.sort((a, b) => b.amount - a.amount);
      const shift = Math.round(newAllocations[0].amount * 0.05);
      newAllocations[0].amount -= shift;
      newAllocations[newAllocations.length - 1].amount += shift;
      return {
        newAllocations,
        explanation: `Balanced highest category (${newAllocations[0].category}) by 5% into ${newAllocations[newAllocations.length - 1].category} for greater operational flexibility.`,
        provider: 'fallback',
      };
    }

    return {
      newAllocations,
      explanation: 'Budget verified and balanced against total target allocation.',
      provider: 'fallback',
    };
  }

  private generateDeterministicVendorBrief(
    event: EventPlan,
    category: string
  ): { briefMarkdown: string; questionsToAsk: string[]; estimatedRange: string; provider: 'gemini' | 'fallback' } {
    const allocation = event.budget.allocations.find(a => a.category.toLowerCase().includes(category.toLowerCase()));
    const budgetStr = allocation ? formatCurrency(allocation.amount, event.budget.currency) : 'Negotiable';

    const briefMarkdown = `# VENDOR REQUEST FOR PROPOSAL: ${category.toUpperCase()}

## 1. Event Overview
* **Celebration Name:** ${event.name}
* **Event Type:** ${event.eventType.toUpperCase()}
* **Date of Event:** ${event.date}
* **Location:** ${event.location || 'Local Area Venue'}
* **Expected Guest Count:** ${event.guestCount} attendees
* **Allocated Budget Ceiling:** ${budgetStr}

## 2. Creative & Design Direction
* **Theme & Atmosphere:** ${event.eventConcept.theme} (${event.eventConcept.style})
* **Color Story:** ${event.eventConcept.colorPalette.join(', ')}
* **Core Vision:** ${event.eventConcept.creativeDirection}

## 3. Scope of Services & Deliverables
* Complete setup, operation, and strike within agreed venue window.
* All necessary permits, licenses, insurance certificates, and equipment redundancy.
* Dedicated lead contact present throughout load-in and execution.

## 4. Proposal Submission Requirements
Please submit:
1. Itemized quotation broken down by labor, materials, and taxes.
2. Portfolio references for similar celebration formats.
3. Inclement weather and cancellation terms.
`;

    const questionsToAsk = [
      'What is your standard policy on overtime or unexpected schedule delays?',
      'Have you worked with our chosen venue or space previously?',
      'What specific equipment redundancies do you bring on site?',
      'What is the payment milestone breakdown and refund policy?',
    ];

    const estimatedRange = allocation
      ? `${formatCurrency(allocation.amount * 0.85, event.budget.currency)} – ${formatCurrency(allocation.amount * 1.1, event.budget.currency)}`
      : `${formatCurrency(25000, event.budget.currency)} – ${formatCurrency(75000, event.budget.currency)}`;

    return { briefMarkdown, questionsToAsk, estimatedRange, provider: 'fallback' };
  }
}

export const aiService = new EventPlanningService();
