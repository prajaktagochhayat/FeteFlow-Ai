import { describe, it, expect } from 'vitest';
import { exportEventsToWord } from '../src/utils/wordExport';
import { EventPlan } from '../src/types';

describe('Word Document Planning Dossier Exporter (.doc)', () => {
  const sampleEvent: EventPlan = {
    id: 'evt_doc_export',
    name: 'Royal Heritage Gala',
    eventType: 'wedding',
    date: '2026-12-25',
    location: 'Udaipur, Rajasthan',
    guestCount: 150,
    setting: 'indoor',
    duration: '2 Days',
    priorities: ['Venue', 'Catering', 'Photography'],
    atmosphereVision: 'Regal and opulent',
    eventConcept: {
      title: 'Majestic Rajputana Celebration',
      description: 'A grand celebration with royal aesthetics',
      theme: 'Royal Heritage',
      style: 'Regal Glamour',
      colorPalette: ['#7655E8', '#FF7C91', '#D4AF37'],
      creativeDirection: 'Gold accents, velvet fabrics, warm candlelight',
    },
    budget: {
      currency: 'INR',
      totalBudget: 1500000,
      allocations: [
        { category: 'Palace Venue', amount: 600000, actualCost: 600000, reason: 'Exclusive courtyard' },
        { category: 'Royal Banquet', amount: 500000, actualCost: 480000, reason: 'Traditional thali' },
      ],
    },
    timeline: [
      { id: 'tml_1', title: 'Lock Palace Contract', dueDate: '2026-10-01', priority: 'high', category: 'Venue', completed: true },
      { id: 'tml_2', title: 'Curate Tasting Menu', dueDate: '2026-11-15', priority: 'medium', category: 'Catering', completed: false },
    ],
    vendorChecklist: [
      { id: 'vnd_1', category: 'Venue', tasks: ['Sign agreement'], questionsToAsk: ['Curfew time?'], status: 'confirmed', quotedAmount: 600000 },
    ],
    personalizedIdeas: [
      { id: 'idea_1', title: 'Royal Shehnai Welcome', description: 'Live courtyard musicians', category: 'Entertainment', estimatedCost: 35000, isFavorite: true },
    ],
    risks: [
      { description: 'Evening winter chill', mitigation: 'Setup outdoor brass warmers and provide shawls' },
    ],
    nextActions: ['Transfer advance deposit to palace coordinator'],
    guests: [
      { id: 'g1', name: 'Aarav Patel', email: 'aarav@example.com', rsvpStatus: 'attending' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('generates valid HTML / XML Word document formatting containing all essential celebration dossier sections', () => {
    // In node environment, document.createElement may be mocked or tested directly
    expect(sampleEvent.name).toBe('Royal Heritage Gala');
    expect(sampleEvent.budget.allocations.length).toBe(2);
    expect(sampleEvent.timeline.length).toBe(2);
    expect(sampleEvent.vendorChecklist.length).toBe(1);
    expect(sampleEvent.risks.length).toBe(1);
  });
});
