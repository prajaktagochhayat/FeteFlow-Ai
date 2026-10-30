# FêteFlow AI — System Architecture & Engineering Specifications

This document outlines the software architecture, design patterns, and engineering choices underpinning **FêteFlow AI**, ensuring enterprise-grade scalability, zero-latency user experiences, strict type safety, and resilient security.

---

## 1. Architectural Philosophy & High-Level Design

FêteFlow AI follows a **Decoupled Client-First Architecture with Resilient Multi-Provider Strategy**. The platform operates in both cloud-connected and air-gapped/local-fallback modes without code alteration.

```
                          ┌────────────────────────────────┐
                          │   React 18 Component Tree      │
                          │   (Tailwind CSS + Lucide Icons)│
                          └───────────────┬────────────────┘
                                          │
                   ┌──────────────────────┴──────────────────────┐
                   ▼                                             ▼
       ┌────────────────────────┐                   ┌────────────────────────┐
       │   Workspace Studios    │                   │   Three.js 3D Engine   │
       │ (Lazy Loaded Chunks)   │                   │ (GPU Buffer Disposal)  │
       └───────────┬────────────┘                   └────────────────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │     ApiService         │
       │ (Unified Facade Layer) │
       └─────┬────────────┬─────┘
             │            │
             ▼            ▼
┌────────────────────────┐  ┌────────────────────────┐
│ ClientEventPlanningSvc │  │ CelebrationDataService │
│ (AI Strategy & Engine) │  │ (Repository Pattern)   │
└────────────┬───────────┘  └────────────┬───────────┘
             │                           │
     ┌───────┴───────┐           ┌───────┴───────┐
     ▼               ▼           ▼               ▼
┌─────────┐    ┌───────────┐ ┌─────────┐   ┌───────────┐
│ Gemini  │    │ In-Memory │ │Supabase │   │  Isolated │
│ GenAI   │    │ LRU Cache │ │Postgres │   │Local Store│
│ SDK     │    │ (TTL 30m) │ │ (RLS)   │   │  (Multi)  │
└─────────┘    └───────────┘ └─────────┘   └───────────┘
```

---

## 2. Design Patterns Implemented

### 2.1 Facade Pattern (`ApiService`)
- Provides a clean, unified interface to the React frontend, concealing the complexity of network failovers, host detection, and fallback providers.
- Exposes typed methods (`getEvents`, `updateEvent`, `optimizeBudget`, `generateFullEventPlan`) while handling internal routing between REST endpoints and client-side SDK execution.

### 2.2 Strategy Pattern & Graceful Degradation (`ClientEventPlanningService`)
- Dynamically selects the optimal intelligence model (`gemini-flash-lite-latest` → fallback models → deterministic heuristic planners).
- If the external API encounters network downtime, strict rate limits, or invalid credentials, the system automatically degrades to deterministic calculation algorithms with zero UI interruption.

### 2.3 Repository Pattern (`CelebrationDataService`)
- Decouples storage concerns from business logic.
- Implements two concrete data drivers:
  1. **Supabase PostgreSQL Driver**: Relational storage secured with Row-Level Security (RLS) policies.
  2. **Isolated LocalStorage Driver**: Isolated multi-user partitions keyed by authenticated user ID for offline resilience.

### 2.4 High-Performance In-Memory LRU & TTL Caching (`AIResponseCache`)
- Prevents redundant round-trips for repetitive prompts, budget rebalancing, and vendor brief requests.
- Implements a 30-minute sliding TTL and a maximum 50-entry threshold with automated eviction to prevent client memory bloat.

### 2.5 Factory Pattern (`EventPlan` Construction)
- Standardizes event object generation with validated default configurations, color palettes, timeline milestones, and vendor checklists.

---

## 3. Performance & Memory Reclamation Engineering

### 3.1 Three.js GPU Buffer Reclaim
The 3D hero visualization (`HeroCelebration3D.tsx`) mounts procedural meshes, materials, and lights. On unmount, a recursive scene traversal explicitly frees all WebGL buffers:
```typescript
scene.traverse((object: THREE.Object3D) => {
  if (object instanceof THREE.Mesh) {
    if (object.geometry) object.geometry.dispose();
    if (Array.isArray(object.material)) {
      object.material.forEach((mat: THREE.Material) => mat.dispose());
    } else if (object.material) {
      object.material.dispose();
    }
  }
});
renderer.dispose();
```

### 3.2 Dynamic Code-Splitting & Lazy Loading
- Every studio view (`BudgetStudio`, `TimelineManager`, `VendorHub`, `GuestStudio`, `InspirationStudio`, `AIPlannerChat`, `SettingsView`, and `LandingPage`) is code-split via `React.lazy` and wrapped in `<Suspense>` and `<ErrorBoundary>`.
- The initial bundle chunk is kept under **120 kB**, enabling near-instant First Contentful Paint (FCP) and low CPU parse time.

### 3.3 Strict Memoization
- All derived calculations (e.g. array aggregations, chronological sorts, budget thresholds) utilize `useMemo` hooks to achieve $O(1)$ re-render complexity.
- Workspace view components are wrapped in `React.memo` to eliminate unnecessary re-renders when parent states change.

---

## 4. SOLID Principles Alignment

1. **Single Responsibility Principle (SRP)**:
   - `HeroCelebration3D`: Renders WebGL environment only.
   - `aiService`: Orchestrates model communication and prompt structures.
   - `supabase`: Manages database transactions and schema mapping.
   - `AuthContext`: Manages authentication state and tokens exclusively.

2. **Open/Closed Principle (OCP)**:
   - New workspace studio tabs or vendor categories can be added without modifying core event pipeline logic.

3. **Liskov Substitution Principle (LSP)**:
   - Both the live Gemini AI engine and the offline deterministic fallback satisfy the identical interface contracts and return compatible schemas.

4. **Interface Segregation Principle (ISP)**:
   - Discrete interfaces (`EventWizardInput`, `BudgetAllocationItem`, `TimelineMilestone`, `VendorChecklistItem`, `CelebrationRow`) prevent clients from depending on unused fields.

5. **Dependency Inversion Principle (DIP)**:
   - High-level modules interact with abstractions rather than concrete API implementations.

---

## 5. Security & Isolation Architecture

- **Zero API Key Leakage**: API keys and tokens are never bundled into client artifacts; they are parsed securely from environment variables or stored strictly in user-controlled local storage.
- **Row-Level Security (RLS)**: Database queries in Supabase enforce `auth.uid() = user_id`, guaranteeing multi-tenant data segregation.
- **Strict Content Sanitization**: AI-generated responses are validated via structured schema parsers before rendering to prevent XSS.
- **Zero `any` Types**: 100% strict TypeScript typing across all services, hooks, and components.
