# BuddyLink Frontend AI Guide

## 🎯 Purpose

This document defines the strict frontend architecture, coding principles, folder layout, naming conventions, design system requirements, and generation workflow for AI-assisted development across the **BuddyLink** web application.

> **CRITICAL INSTRUCTION FOR AI AGENTS**:
> Any generated code MUST strictly follow the design tokens in `DESIGN.md`, the shared components in `FRONTEND_SHARE_COMPONENTS.md`, the directory structure in `FRONTEND_STRUCTURE.md`, and the conventions in `FRONTEND_CONVENTION.md`.

---

## 🛠️ Technology Stack

- **Framework**: React 18+ with Vite
- **Language**: JavaScript (ES Modules, `.jsx` for UI, `.js` for logic)
- **State Management**: Redux Toolkit (RTK) & RTK Query
- **Routing**: React Router DOM (v6+)
- **Styling**: TailwindCSS & Design System Tokens (`Plus Jakarta Sans`)
- **HTTP Client**: Axios (Centralized via `services/apiClient.js`)
- **Realtime**: Socket.io Client (`services/socket.js`)
- **Forms & Validation**: React Hook Form + Zod
- **Icons**: Lucide React (Stroke width `1.5px` to `1.75px`)
- **Date Handling**: Day.js

---

## 📐 Core Architectural Principles

All frontend features MUST strictly adhere to the unidirectional data and control flow:

```text
User Event / Interaction
         │
         ▼
Page View (`modules/<feature>/pages/`)
         │
         ▼
Custom Hook (`modules/<feature>/hooks/`)
         │
         ▼
Redux Slice / RTK Query (`modules/<feature>/redux/`)
         │
         ├──────────────────────────┐
         ▼                          ▼
REST API (`apiClient.js`)      Socket Client (`socket.js`)
         │                          │
         └─────────────┬────────────┘
                       ▼
             BuddyLink Express Backend
```

**Rule**: **NEVER skip layers.** Components never call API endpoints directly.

---

## 🎨 Design System & Aesthetic Rules (From Stitch)

1. **Typography**:
   - Primary Font: **`Plus Jakarta Sans`**
   - Font weights: Medium (`500`) and Semi-Bold (`600`) for headers and labels. Never use aggressive heavy weights.
2. **Color Palette**:
   - Primary (Soft Matcha Green): `#7BAE7F` (Hover: `#66996a`, Deep: `#396940`)
   - Secondary (Soft Cloud Blue): `#92C5DE` / `#B1E4FE`
   - Tertiary (Butter Yellow / Stars): `#F6D186`
   - Canvas Background: `#FAFBF9` / `#F9F9FF`
   - Card Surface: `#FFFFFF` with hairline border `1px solid #EDF2F0`
   - Neutral Primary: `#2D3748` / `#121C2C`
   - Neutral Secondary: `#718096` / `#717970`
3. **Corner Radii**:
   - Inputs, Buttons & Selects: `rounded-xl` (12px–14px)
   - Cards, Containers & Modules: `rounded-2xl` (16px–20px)
   - Badges, Chips & Avatars: `rounded-full` (9999px)
4. **Elevation**:
   - Flat minimalist look at rest (no heavy drop shadows, only 1px hairline border `#EDF2F0`).
   - Floating Modals & Sheets: Soft diffused ambient shadow `box-shadow: 0 16px 40px -8px rgba(45, 55, 72, 0.08)` paired with backdrop blur `backdrop-filter: blur(8px)`.

---

## 📦 Feature Module Layout (`src/modules/<feature>/`)

Every feature module must be structured uniformly:

```text
modules/playdate/
├── api/             # API caller functions (playdateApi.js)
├── hooks/           # Domain business hooks (usePlaydate.js)
├── redux/           # Redux slice or RTK Query endpoints (playdateSlice.js)
├── pages/           # Page routes (PlaydateDiscoveryPage.jsx, PlaydateDetailPage.jsx)
├── components/      # Module-only UI (PlaydateCard.jsx, MatchFilterDrawer.jsx)
├── validation/      # Form schema validations (playdateValidation.js)
└── constants/       # Enums and constants (playdateConstants.js)
```

---

## 🚫 Hard Enforcement Rules

### ✅ ALWAYS:
1. **Separate UI and Logic**: JSX files (`.jsx`) only handle rendering, event wiring, and local UI animations. All state manipulation, API calls, and business validation belong in custom hooks (`.js`).
2. **Use Shared Components**: Reuse components from `src/components/` (`Button`, `Input`, `PasswordInput`, `Textarea`, `Checkbox`, `Switch`, `Select`, `Card`, `Modal`, `ConfirmDialog`, `VerifiedBadge`, `StatusChip`, `InterestTag`, `Avatar`, `Sidebar`, `Tabs`, `Pagination`, `SearchBar`, `FilterChips`) instead of rewriting ad-hoc styles.
3. **Centralized API Client**: Use `services/apiClient.js` for all HTTP requests to guarantee token injection, refresh handling, and error formatting.
4. **Encapsulate Realtime**: Manage all Socket.io subscriptions within custom hooks (e.g. `useChatSocket`, `useNotificationSocket`) and always clean up listeners in `useEffect` returns.

### ❌ NEVER:
1. **NEVER** import or call `axios` directly inside a React component or page.
2. **NEVER** write business logic, formulas, or complex validations directly in JSX.
3. **NEVER** hardcode API URLs or secrets in components; always reference `import.meta.env.VITE_*`.
4. **NEVER** combine multiple unrelated page views or giant state trees into a single monolithic file.
5. **NEVER** use aggressive harsh colors (plain red, neon blue) or arbitrary border radii that violate the BuddyLink Design System.