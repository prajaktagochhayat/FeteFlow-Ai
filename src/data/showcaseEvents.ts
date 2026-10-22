import { EventPlan } from '../types';

export const SHOWCASE_EVENTS: EventPlan[] = [
  {
    id: 'evt_wedding_showcase',
    name: 'Ananya & Kabir’s Ethereal Garden Wedding',
    eventType: 'wedding',
    date: '2027-02-14',
    location: 'Meadowood Courtyard & Glasshouse, Bangalore',
    guestCount: 150,
    setting: 'outdoor',
    duration: '2 Days',
    priorities: ['Atmosphere & Decor', 'Catering & Dining', 'Photography & Cinema'],
    atmosphereVision: 'Dreamy twilight botanical celebration with warm cascading fairy lanterns, velvet textiles, and raw floral arches.',
    eventConcept: {
      title: 'Botanical Twilight Romance',
      description: 'An enchanted open-air celebration harmonizing lush verdant foliage, soft lavender candle clusters, and warm golden acoustic melodies under the starlight.',
      theme: 'Enchanted Starlight Garden',
      style: 'Modern Romantic Chic',
      colorPalette: ['#7655E8', '#EDE6FF', '#FF7C91', '#FFFCF7', '#C5B4FF'],
      creativeDirection: 'Contrast deep violet twilight florals against soft ivory linens. Ground seating with layered antique rugs, hanging glass terrariums, and acoustic string quartets.'
    },
    budget: {
      currency: 'INR',
      totalBudget: 1500000,
      allocations: [
        { category: 'Venue & Glasshouse Reservation', amount: 480000, reason: 'Exclusivity for 48 hours, bridal suite and catering prep lawn', actualCost: 450000 },
        { category: 'Artisanal Catering & Beverage Bar', amount: 450000, reason: 'Multi-regional fusion dinner, mocktail laboratory, and late-night street food stalls', actualCost: 420000 },
        { category: 'Documentary Photography & Cinema', amount: 220000, reason: 'Two lead photographers, drone coverage, and same-day highlight reel', actualCost: 220000 },
        { category: 'Floral Installations & Ambiance', amount: 200000, reason: 'Wildflower arches, micro-pendant fairy chandeliers, and dining tablescapes', actualCost: 180000 },
        { category: 'Live Music & Sound Engineering', amount: 150000, reason: 'Ceremony harpist, evening jazz quintet, and professional sound amplification', actualCost: 0 }
      ]
    },
    timeline: [
      { id: 'tml_w1', title: 'Confirm Glasshouse Venue Contract & Escrow Deposit', description: 'Lock in load-in windows and noise waiver agreements', dueDate: '2026-11-15', priority: 'high', category: 'Venue', completed: true },
      { id: 'tml_w2', title: 'Curate 5-Course Tasting Menu with Caterer', description: 'Review vegan alternatives and signature welcome spritzers', dueDate: '2026-12-05', priority: 'high', category: 'Catering', completed: true }
    ],
    vendorChecklist: [
      { id: 'vnd_w1', category: 'Venue & Architecture', tasks: ['Verify generator power backup capacity'], questionsToAsk: ['What is the hard sound cutoff hour?'], status: 'confirmed', quotedAmount: 480000 }
    ],
    personalizedIdeas: [
      { id: 'idea_w1', title: 'Interactive Artisan Perfume Bar', description: 'Guests blend botanical essential oils into personalized keepsakes.', estimatedCost: 35000, category: 'decor', reason: 'Memorable sensory anchor.' }
    ],
    nextActions: [
      'Finalize tasting menu with chef',
      'Send digital save-the-dates',
      'Approve acoustic playlist'
    ],
    risks: [
      { id: 'r1', description: 'Afternoon tropical rain shower', severity: 'medium', mitigation: 'Retractable glass roof deployed within 90 seconds.' }
    ],
    guests: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'evt_birthday_showcase',
    name: 'Aarav’s 10th Intergalactic Science Odyssey',
    eventType: 'birthday',
    date: '2026-11-28',
    location: 'Cosmic Loft & Observatory, Indiranagar',
    guestCount: 35,
    setting: 'indoor',
    duration: '4 Hours',
    priorities: ['Interactive Entertainment', 'Cake & Pastry Sculptures', 'Themed Favors'],
    atmosphereVision: 'Futuristic planetary bioluminescence, dry-ice fog discovery lab, and deep galaxy nebula projections.',
    eventConcept: {
      title: 'Cosmic Nebula Discovery',
      description: 'An interactive sci-fi exploration party with real telescope constellation observation, liquid nitrogen ice-cream crafting, and astronaut flight training challenges.',
      theme: 'Deep Space Odyssey',
      style: 'Futuristic Cyber-Glow',
      colorPalette: ['#100E18', '#7655E8', '#00D2D3', '#FFD166', '#FF7C91'],
      creativeDirection: 'Blackout drapes with UV laser projection, constellation maps on floor pods, and glowing meteorite centerpieces.'
    },
    budget: {
      currency: 'INR',
      totalBudget: 450000,
      allocations: [
        { category: 'Cosmic Venue & Projector Rig', amount: 140000, reason: 'Full 360 dome projection space and astronomy lab room', actualCost: 140000 },
        { category: 'Interactive Science Shows & Performers', amount: 110000, reason: '2 science educators, liquid nitrogen show, rocket launch zone', actualCost: 110000 },
        { category: 'Custom Zero-G Gravity Cake & Snacks', amount: 80000, reason: 'Rotating galaxy planet cake with edible sparkling dust', actualCost: 75000 },
        { category: 'Astronaut Gear & Gift Kits', amount: 65000, reason: 'Custom flight badges, prism telescopes, and freeze-dried treats', actualCost: 65000 },
        { category: 'Photography & Highlight Reel', amount: 55000, reason: 'Action capture of rocket experiments and family portraits', actualCost: 50000 }
      ]
    },
    timeline: [
      { id: 'tml_b1', title: 'Book Observatory Space & Audio-Visual Technicians', description: 'Verify HDMI projector array and UV light fixtures', dueDate: '2026-10-15', priority: 'high', category: 'Venue', completed: true },
      { id: 'tml_b2', title: 'Order Custom 3D Astronaut Flight Badges with Names', description: 'Proof kid guest names for personalized patch embroidery', dueDate: '2026-11-01', priority: 'medium', category: 'Favors', completed: true }
    ],
    vendorChecklist: [
      { id: 'vnd_b1', category: 'Entertainment & Science Hosts', tasks: ['Review safety protocol for dry-ice demonstrations'], questionsToAsk: ['Are materials safe for children aged 8-12?'], status: 'confirmed', quotedAmount: 110000 }
    ],
    personalizedIdeas: [
      { id: 'idea_b1', title: 'Build-Your-Own Hydro-Rocket Launch', description: 'Kids construct mini pressurized rockets and launch across target landing pads.', estimatedCost: 18000, category: 'entertainment', reason: 'Thrilling experiential centerpiece.' }
    ],
    nextActions: [
      'Finalize space observatory dome schedule',
      'Test rocket launcher pressure valves',
      'Confirm flight badge patches delivery'
    ],
    risks: [
      { id: 'rb1', description: 'Liquid nitrogen spill hazard', severity: 'low', mitigation: 'Strict safety goggles and perimeter barriers manned by educators.' }
    ],
    guests: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'evt_community_showcase',
    name: 'Bloom & Harvest Spring Community Fair',
    eventType: 'community',
    date: '2027-04-18',
    location: 'Cubbon Park Pavilion Greens, Bangalore',
    guestCount: 300,
    setting: 'outdoor',
    duration: 'Full Day',
    priorities: ['Local Artisan Stalls', 'Acoustic Folk Stage', 'Waste-Free Composting'],
    atmosphereVision: 'Sun-drenched yellow gingham tables, wildflower seed-bomb workshops, and local farmers fresh harvest markets.',
    eventConcept: {
      title: 'Verdant Spring Gathering',
      description: 'A sustainable open festival bringing together local organic growers, neighborhood musicians, zero-waste workshops, and family baking contests.',
      theme: 'Sustainable Spring Awakening',
      style: 'Rustic Eco-Chic',
      colorPalette: ['#10B981', '#F59E0B', '#3B82F6', '#EDE6FF', '#241D35'],
      creativeDirection: 'Recycled wood directional signage, bunting from upcycled sarees, and acoustic lawn seating.'
    },
    budget: {
      currency: 'INR',
      totalBudget: 250000,
      allocations: [
        { category: 'Municipal Lawn Permit & Cleanliness Escrow', amount: 65000, reason: 'City municipal permit and post-event grounds sweep', actualCost: 65000 },
        { category: 'Solar Sound Stage & Acoustic PA System', amount: 70000, reason: 'Zero-emission solar battery power for singer-songwriters', actualCost: 68000 },
        { category: 'Artisan Canopy Stalls & Benches', amount: 55000, reason: '20 bamboo craft booths and hay-bale family seating', actualCost: 55000 },
        { category: 'Zero-Waste Water & Composting Stations', amount: 35000, reason: 'Filtered hydration refill tanks and color-coded sorting bins', actualCost: 32000 },
        { category: 'Printed Canvas Banners & Safety First Aid', amount: 25000, reason: 'Cotton cloth maps and certified emergency paramedic tent', actualCost: 25000 }
      ]
    },
    timeline: [
      { id: 'tml_c1', title: 'Submit Municipal Park Green Event Application', description: 'Include crowd management and waste segregation scheme', dueDate: '2027-01-20', priority: 'high', category: 'Permits', completed: true }
    ],
    vendorChecklist: [
      { id: 'vnd_c1', category: 'Solar Power & Stage Engineering', tasks: ['Confirm solar battery reserve for 8 continuous hours'], questionsToAsk: ['Is there a backup silent generator?'], status: 'confirmed', quotedAmount: 70000 }
    ],
    personalizedIdeas: [
      { id: 'idea_c1', title: 'Seed-Bomb Making Station', description: 'Families roll native wildflower seeds in clay balls to plant at home.', estimatedCost: 12000, category: 'activities', reason: 'Tangible environmental takeaway.' }
    ],
    nextActions: [
      'Confirm park permit stamp with municipal authority',
      'Distribute stainless steel cups deposit list',
      'Sound check acoustic solar stage'
    ],
    risks: [
      { id: 'rc1', description: 'Park plastic littering', severity: 'medium', mitigation: 'Strict ban on single-use bottles; free stainless steel cups on deposit.' }
    ],
    guests: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];
