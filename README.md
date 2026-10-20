# FêteFlow AI — An AI-Powered Celebration & Event Planning Platform

> *"Big moments. Zero chaos."*  
> **"MAKE ROOM FOR THE MAGIC."**  
> *"From the first idea to the final confetti, let AI plan a celebration that feels unmistakably yours."*

---

## 🌟 Overview

**FêteFlow AI** is a celebration and event planning web application built for a GenAI hackathon. It helps hosts, couples, families, and organizers plan weddings, birthdays, anniversaries, and community gatherings with genuine generative AI, persistent event data, budget health calculations, and actionable timeline schedules.

### Hackathon Problem Statement Alignment
> *"Create a GenAI-powered planning assistant that helps users organize weddings, birthdays, and community events with budgets, timelines, vendor checklists, and personalized ideas."*

FêteFlow AI addresses every element of this objective:
1. **Genuine Generative AI**: Google Gemini integration (`@google/generative-ai`) with structured JSON schema outputs and automatic fallback planning engine.
2. **Weddings, Birthdays & Community Events**: Dedicated workflows, domain-specific budget allocations, timeline milestones, and creative themes for each.
3. **Budget Creation & Tracking**: Real-time spending versus planned limits, SVG Donut allocation charts, overrun warnings, and conversational AI budget rebalancing.
4. **Timeline Generation & Management**: Chronological milestone schedule with priorities, due dates, filtering, and AI Timeline Recovery for overdue tasks.
5. **Vendor Checklists & AI RFPs**: Dynamic vendor categories with AI-generated formal vendor briefs (Request for Quotes) and questions to ask.
6. **Guest Experience Studio**: RSVP tracking, dietary restrictions, accessibility needs, and AI-generated invitation copy in 4 distinct tones.
7. **Creative Inspiration Studio**: Tactile mood-board cards, signature color palette swatches, and personalized creative concepts.
8. **3D Experience**: Interactive Three.js celebration art canvas with glossy floating balloons, sculptural gift box, confetti, and ambient lighting.
9. **Magnetic Orb Cursor**: Custom physics-interpolated cursor for desktop pointer devices with touch/reduced-motion disablement.
10. **Full Light & Dark Theme**: Cohesive design system tokens with persistent preferences.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Three.js 3D, Canvas-Confetti.
- **Backend**: Node.js, Express, Zod schema validation, `@google/generative-ai`.
- **Persistence**: File-backed atomic JSON store (`server/data/events.json`) with pre-seeded demo celebrations.
- **Testing**: Vitest unit and integration test suite.

---

## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Google Gemini API key:
```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```
*(Note: If no API key is provided, FêteFlow AI automatically runs in Demo / Offline Mode with an intelligent local planning engine. You can also enter your key at runtime in the in-app Settings panel!)*

### 3. Run Development Server
```bash
npm run dev
```
- Client runs on `http://localhost:5173`
- Server API runs on `http://localhost:3001`

### 4. Run Automated Tests
```bash
npm test
```

### 5. Production Build
```bash
npm run build
```

---

## 🔒 Security & Data Hygiene
- **Zero Client-Side Secret Leakage**: API keys remain strictly on the Express backend and are never bundled into client JavaScript.
- **Validation**: All user inputs and AI outputs are validated using Zod schemas (`EventPlanSchema`, `EventWizardInputSchema`).
- **Data Portability**: Users can export their complete event records as standard JSON or restore demo celebrations from the Settings tab.
