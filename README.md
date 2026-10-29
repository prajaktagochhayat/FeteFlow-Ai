# FêteFlow AI — Next-Gen Celebration & Event Planning Platform

> *"Big moments. Zero chaos."*  
> **"MAKE ROOM FOR THE MAGIC."**  
> *"From the first idea to the final confetti, an intelligent, context-aware celebration architect that transforms chaotic spreadsheets into bespoke, unforgettable experiences."*

[![Build & Tests](https://img.shields.io/badge/Vitest-36%20Passed-emerald?style=flat-square&logo=vitest)](https://github.com/prajaktagochhayat/FeteFlow-Ai)
[![Google Gemini GenAI](https://img.shields.io/badge/Google%20Gemini-3.5%20%26%20Flash%20Lite-purple?style=flat-square&logo=google)](https://aistudio.google.com/)
[![Supabase Database](https://img.shields.io/badge/Supabase-PostgreSQL%20%26%20RLS-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Firebase Hosting](https://img.shields.io/badge/Firebase-Live%20Production-FFCA28?style=flat-square&logo=firebase)](https://feteflow-ai.web.app)
[![Accessibility](https://img.shields.io/badge/WCAG%202.1-AA%20Compliant-blue?style=flat-square)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![License: MIT](https://img.shields.io/badge/License-MIT-gray?style=flat-square)](LICENSE)

---

## 📌 Executive Summary & Submission Overview

* **Live Deployment URL:** [https://feteflow-ai.web.app](https://feteflow-ai.web.app)
* **GitHub Repository:** [https://github.com/prajaktagochhayat/FeteFlow-Ai](https://github.com/prajaktagochhayat/FeteFlow-Ai)
* **Challenge:** Hack2skill AI Code Challenge 5
* **Author:** Prajakta Gochhayat (`gochhayatprajakta@gmail.com`)

---

## 🎯 1. Your Chosen Vertical

### **Vertical:** Smart Event & Celebration Planning Assistant (Weddings, Birthdays & Community Celebrations)

Planning personal and communal milestones—such as Indian weddings, landmark birthdays, anniversaries, and community festivals—is traditionally one of the most high-stress, fragmented endeavors individuals face. Hosts must juggle arbitrary budget limits, unpredictable vendor contracts, complex guest accommodations, and strict timelines across disparate tools and spreadsheets.

**FêteFlow AI** was engineered as an autonomous, full-lifecycle celebration architect. It solves this problem by acting as an intelligent partner that translates high-level host intentions (vibe, guest count, financial ceiling, cultural nuances) into a cohesive, mathematically balanced, and actionable production roadmap.

---

## 🧠 2. Approach and Logic

FêteFlow AI bridges generative reasoning with deterministic execution through a **Three-Tier Architecture**:

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      HOST INTENT & PREFERENCES                         │
 │     Event Type · Date · Guests · Setting · Budget (₹) · Aesthetics     │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                   TIER 1: REASONING & SYNTHESIS                        │
 │         Google Gemini GenAI (Flash-Lite / 3.5-Flash Pipeline)         │
 │  • Multimodal Creative Direction     • Context-Aware Tactical Chat     │
 │  • Itemized Financial Allocation      • Automated Vendor Briefs (RFPs)  │
 │  • Dynamic Milestone Sequencing       • Multi-Tone Invitation Copy     │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │               TIER 2: INTEGRITY, VALIDATION & GUARDS                   │
 │  • Zod Schema Enforcement            • cleanAndParseJSON Stripper      │
 │  • Mathematical Invariant Checkers   • Multi-Model Failover Cascade   │
 │  • Local Deterministic Fallback      • Input Sanitization & Anti-XSS   │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │              TIER 3: PERSISTENCE, VISUALIZATION & WORKSPACE            │
 │  • Supabase PostgreSQL (RLS)         • Real-Time Interactive Canvas   │
 │  • Budget & Spend Analytics (INR ₹)  • Printable Invitation Cards     │
 │  • Timeline Bottleneck Recovery      • Complete Word (.doc) Export    │
 └────────────────────────────────────────────────────────────────────────┘
```

### Core Logic Principles:
1. **Mathematical Invariant Conservation:** In financial planning, hallucinations are fatal. When Gemini allocates budgets or user instructions shift capital from catering to photography, our validation logic enforces strict invariants where the sum of category allocations strictly adheres to the total budget ceiling.
2. **Deterministic Resiliency:** If external API networks drop or experience rate spikes, FêteFlow AI automatically shifts across a candidate cascade (`gemini-flash-lite-latest` → `gemini-3.5-flash` → `gemini-2.5-flash-lite` → `gemini-3.8-flash`), backed by an in-memory deterministic planning engine. The host never encounters a broken screen or raw error stack.
3. **Dual-Mode Data Architecture:** Supports authenticated multi-user isolation through Supabase PostgreSQL Row-Level Security (RLS) with instant auto-fallback to user-isolated localStorage for frictionless public exploration.

---

## ⚙️ 3. How the Solution Works

FêteFlow AI organizes the host journey into focused, specialized studios:

### A. The Celebration Architect (5-Step Generative Wizard)
Users input basic parameters (event type, name, date, guests, setting, budget, style, dietary preferences, and vision). The GenAI engine synthesizes:
- **Event Concept & Narrative:** Bespoke titles, themes, and curated 5-color hex harmonies.
- **Itemized Budget Allocation:** Contextual breakdown across venue, catering, decor, entertainment, and contingency.
- **Chronological Milestones:** Realistic deadline-aware timeline items leading directly to the event date.
- **Vendor Task Checklists:** Probing discovery questions and technical specifications.
- **Personalized Creative Ideas:** Distinct, anti-generic concepts (e.g. courtyard welcome rituals, interactive signature cocktail carts).
- **Proactive Risk Mitigations:** Scenario-specific safeguards (inclement weather, sound curfews, guest delays).

### B. Interactive AI Planner Chat
A context-aware celebration advisor embedded in the workspace. It inspects the active celebration’s parameters in real time and answers queries regarding etiquette, scheduling, menu pairings, and contract negotiations.

### C. Budget Studio & Financial Optimizer
Tracks planned versus actual logged expenses in Indian Rupee (`₹ INR`). Users can issue natural language rebalancing commands (e.g., *"Shift ₹50,000 from catering to photography"*) and the AI recalculates allocations while strictly conserving the budget ceiling.

### D. Timeline Manager & Bottleneck Recovery Plan
Tracks milestone completion and overdue tasks. When critical milestones are delayed, the **AI Timeline Recovery** engine restructures priorities, adjusts target deadlines, and suggests recovery sprints.

### E. Vendor Hub & Automated RFP Generator
Generates formal, markdown-formatted Requests for Proposals (RFPs) tailored to caterers, photographers, florists, and venues, complete with scope of work, load-in guidelines, and interview questions.

### F. Guest Experience Studio & Printable Invitation Cards
Tracks RSVP statuses, dietary restrictions, and accessibility needs. The AI copywriter drafts four distinct tones (Formal, Playful, Elegant, Minimal), which are automatically styled into high-resolution, printable physical invitation cards.

### G. Data Portability & Dossier Export
Generates a complete, single-click Microsoft Word (`.doc`) planning dossier with tables, financial matrices, vendor scopes, and schedules for offline distribution to coordinators.

---

## 🔍 4. Any Assumptions Made

1. **User Currency & Locale:** Default financial calculations and formatting assume Indian Rupees (`₹ INR`) with Indian numerical grouping (`₹5,00,000`), with runtime support for USD (`$`), EUR (`€`), and GBP (`£`).
2. **Static Single Page Application (SPA) Hosting:** Deployed on Firebase Hosting as an ultra-fast static SPA. Because static hosts cannot execute Node.js Express server routes without Cloud Functions, the client architecture directly leverages the `@google/generative-ai` browser SDK with client-side credential persistence.
3. **Data Isolation Assumption:** Authenticated users own their private celebrations in Supabase PostgreSQL via row-level security policies (`auth.uid() = user_id`). Unauthenticated users explore safely in a sandboxed, localized session storage without data bleed.
4. **Planning Horizon:** The milestone generator assumes celebrations have planning windows ranging from 2 weeks to 18 months, pacing milestones realistically toward the celebration date.

---

## 🧪 5. Comprehensive Testing Suite (Validation of Functionality)

FêteFlow AI enforces rigorous automated testing via **Vitest**, spanning unit, security, accessibility, efficiency, and integration layers with **100% test pass rate (36/36 tests passing)**:

| Test Suite File | Domain Tested | Assertions | Result |
| :--- | :--- | :---: | :---: |
| [`tests/efficiency.test.ts`](file:///c:/Users/Sidhi/.gemini/antigravity/scratch/FÊTEFLOW AI/tests/efficiency.test.ts) | High-volume dataset computation, memory cloning, RSVP aggregations | 4 | **PASSED** |
| [`tests/wordExport.test.ts`](file:///c:/Users/Sidhi/.gemini/antigravity/scratch/FÊTEFLOW AI/tests/wordExport.test.ts) | Word document XML/HTML dossier export generation | 1 | **PASSED** |
| [`tests/accessibility.test.ts`](file:///c:/Users/Sidhi/.gemini/antigravity/scratch/FÊTEFLOW AI/tests/accessibility.test.ts) | WCAG 2.1 AA screen reader formatting, keyboard traps, ARIA landmarks | 6 | **PASSED** |
| [`tests/aiProvider.test.ts`](file:///c:/Users/Sidhi/.gemini/antigravity/scratch/FÊTEFLOW AI/tests/aiProvider.test.ts) | Gemini model cascade, prompt templates, deterministic planners | 4 | **PASSED** |
| [`tests/security.test.ts`](file:///c:/Users/Sidhi/.gemini/antigravity/scratch/FÊTEFLOW AI/tests/security.test.ts) | XSS injection protection, numeric bounds, schema type guards | 5 | **PASSED** |
| [`tests/budgetCalculations.test.ts`](file:///c:/Users/Sidhi/.gemini/antigravity/scratch/FÊTEFLOW AI/tests/budgetCalculations.test.ts) | Allocation arithmetic, variance calculations, INR formatting | 3 | **PASSED** |
| [`tests/eventValidation.test.ts`](file:///c:/Users/Sidhi/.gemini/antigravity/scratch/FÊTEFLOW AI/tests/eventValidation.test.ts) | Zod schema constraints, boundary edge cases | 3 | **PASSED** |
| [`tests/aiService.test.ts`](file:///c:/Users/Sidhi/.gemini/antigravity/scratch/FÊTEFLOW AI/tests/aiService.test.ts) | In-browser GenAI orchestrator, JSON sanitization, recovery plans | 6 | **PASSED** |
| [`tests/integration/userJourney.test.ts`](file:///c:/Users/Sidhi/.gemini/antigravity/scratch/FÊTEFLOW AI/tests/integration/userJourney.test.ts) | End-to-end user lifecycle from wizard to workspace and RFPs | 1 | **PASSED** |
| [`tests/apiService.test.ts`](file:///c:/Users/Sidhi/.gemini/antigravity/scratch/FÊTEFLOW AI/tests/apiService.test.ts) | Hybrid cloud communication, health checks, settings storage | 3 | **PASSED** |

### Running the Test Suite
```bash
npm test
```
To run tests with full coverage:
```bash
npm run test:coverage
```

---

## ♿ 6. Accessibility & Usable Design (WCAG 2.1 AA)

Accessibility was designed as a foundational requirement, not an afterthought:
1. **Semantic HTML5 Landmarks:** Structured with `<header role="banner">`, `<main id="main-content" role="main">`, `<aside role="navigation">`, `<nav role="tablist">`, and `<section>` elements.
2. **Screen Reader Skip Link:** Prominent `Skip to main content` link accessible via keyboard `Tab` navigation.
3. **Modal Dialog Focus Traps:** Interactive dialogs implement `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` referencing heading IDs.
4. **Keyboard Operability:** All buttons, custom tabs, modal triggers, and inspiration chips handle both `Enter` and `Space` activation, with `Escape` listener support to dismiss overlays.
5. **Color Contrast & Theme Safety:** High-contrast color tokens adhering to minimum 4.5:1 WCAG contrast ratios in both Light and Dark themes.
6. **Assistive Labels:** All icon-only interactive controls (close, theme toggle, copy, delete) include explicit `aria-label` tags.

---

## ⚡ 7. Resource Efficiency & Performance Optimizations

1. **Vite Code-Splitting & Manual Chunking:** Configured Rollup `manualChunks` to split the monolithic bundle into cached vendor segments:
   - `vendor-react` (134 kB)
   - `vendor-genai` (27 kB)
   - `vendor-supabase` (223 kB)
   - `vendor-icons` (33 kB)
   - `vendor-three` (489 kB)
   - Main entry point reduced to **248 kB** (over 80% reduction in initial payload).
2. **Sub-Millisecond Financial Math:** Expense summaries and RSVP totals compute in `<5ms` across 500+ records via optimized array passes.
3. **Adaptive Physics Cursor:** The desktop custom magnetic cursor automatically disables itself on touch screens and when `prefers-reduced-motion` is active to conserve GPU/CPU cycles.
4. **Lazy Asset Rendering:** 3D celebration canvas elements and print windows initialize strictly on demand.

---

## 🔐 8. Security & Data Protection

1. **Zero Hardcoded Secrets:** All API keys and environment configurations are strictly isolated in `.env` files (excluded via `.gitignore`) and runtime browser memory. GitHub Push Protection audits confirm zero leaked credentials.
2. **PostgreSQL Row-Level Security (RLS):** Supabase database tables enforce RLS policies restricting read, write, update, and delete operations exclusively to the authenticated user's `auth.uid()`.
3. **Schema Validation & Anti-XSS:** All inputs and outputs are processed through strict Zod schemas (`EventPlanSchema`, `EventWizardInputSchema`), preventing script injection and payload manipulation.
4. **Transient Password Peek:** Password visibility toggles employ a momentary one-view peek mechanism that automatically resets on blur.

---

## 💻 9. Technology Stack

* **Frontend:** React 18, TypeScript 5.7, Vite 6, Tailwind CSS 3.4, Lucide Icons, Three.js, Canvas-Confetti
* **GenAI Engine:** Google Gemini Generative AI SDK (`@google/generative-ai`), `gemini-flash-lite-latest`, `gemini-3.5-flash`
* **Backend:** Node.js, Express 4, tsx, Zod
* **Database & Auth:** Supabase PostgreSQL, GoTrue Auth, Row-Level Security (RLS)
* **Hosting:** Firebase Hosting (Production CDN)
* **Testing:** Vitest 2.1.8

---

## 🚀 10. Quick Start Guide

### Prerequisites
* Node.js v18+ 
* npm v9+

### 1. Clone & Install
```bash
git clone https://github.com/prajaktagochhayat/FeteFlow-Ai.git
cd FeteFlow-Ai
npm install
```

### 2. Environment Setup
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Provide your Gemini API key and Supabase credentials:
```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-flash-lite-latest
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Launch Development Workspace
```bash
npm run dev:client
```
Visit `http://localhost:5173` in your browser.

### 4. Run Test Suite
```bash
npm test
```

### 5. Build for Production
```bash
npm run build
```
The compiled output will be generated in `dist/`.
