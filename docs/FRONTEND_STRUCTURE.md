# BuddyLink Frontend Structure

Modular, Feature-Driven Frontend Architecture built with **React**, **Vite**, **Redux Toolkit**, and **TailwindCSS / Design System Tokens**.

---

## 📁 Source Tree (`src/`)

```text
src/
├── app/               # Redux store configuration
├── assets/            # Static assets (images, logos, svg icons)
├── components/        # Shared reusable UI primitives
├── hooks/             # Shared application hooks
├── layouts/           # Layout wrappers (AuthLayout, MainLayout)
├── routes/            # Route configurations & Guards
├── services/          # API & realtime client configs
├── constants/         # App-wide constants
├── utils/             # Helper functions
├── styles/            # Design system tokens, TailwindCSS entry, global styles
├── test/              # Test suite (setup, testUtils, mocks, unit, components, hooks)
├── modules/           # Business feature modules
│
├── App.jsx            # Top-level application component & route provider
└── main.jsx           # Vite application entry point
```

---

## 🏛️ Folder Responsibilities

### `app/`

- Configures Redux Toolkit Store (`store.js`).
- Combines global slices, middleware listeners, and RTK Query APIs.

### `components/`

- Pure, reusable UI components without domain-specific business logic.
- Conforms to **BuddyLink Design System** (`Button`, `Card`, `StatCard`, `EmptyState`, `VerifiedBadge`, `StatusChip`, `InterestTag`, `Avatar`, `Input`, `PasswordInput`, `Textarea`, `Checkbox`, `Switch`, `Select`, `Dropdown`, `Modal`, `ConfirmDialog`, `Sidebar`, `Tabs`, `Pagination`, `SearchBar`, `FilterChips`, `DataTable`).
- **Main Navigation Tabs (`NAV_LINKS` in `navigation.constants.js`)**:
  1. `Khám phá` (`/discovery`) - Search & match nearby peers.
  2. `Kết nối` (`/connections`) - Friend requests & connections.
  3. `Tin nhắn` (`/chat`) - 1-on-1 and playdate messaging.
  4. `Hẹn chơi` (`/playdates`) - Playdate scheduling & invitations.
  5. `Thành tích` (`/gamification`) - Weekly playdate streak & achievement badges.

### `hooks/`

- Shared general React hooks (e.g. `useClickOutside`, `useDebounce`, `useSearch`, `useTableSort`, `useToast`).

### `layouts/`

- Page frame layouts incorporating common navigation bars, footers, and sidebars (`AuthLayout`, `MainLayout`).

### `routes/`

- Centralized router definition using `react-router-dom` (v6+) with code-splitting (`lazy`, `Suspense`).
- **`appRoutes.jsx`**:
  - Root path `/`: Renders **`LandingPage`** for unauthenticated guests; automatically redirects authenticated users to their corresponding role homepage (`/discovery` for Parents, `/admin/dashboard` for Admins).
- Role-based route guards: `PublicRoute.jsx`, `ProtectedRoute.jsx`, `RoleRoute.jsx`.
- Sub-route definitions: `ParentRoutes.jsx`, `AdminRoutes.jsx`.

### `services/`

- **`apiClient.js`**: Axios instance with automatic JWT header attachment, token refresh interceptors, and unified error handling.
- **`socket.js`**: Socket.io client connection management for realtime chat & instant notifications.

### `constants/` & `utils/`

- Named files (no barrel index files): `api.constants.js`, `storage.constants.js`, `role.constants.js`, `cn.js`, `formatters.js`, `errorUtils.js`.

### `test/`

- Vitest + React Testing Library test infrastructure: `setup.js`, `testUtils.jsx` (`renderWithProviders`), `mocks/mockData.js`, `unit/`, `components/`, `hooks/`.

---

## 🧩 Business Modules (`modules/`)

Aligned directly with the **BuddyLink Backend Modular Monolith**:

| Module                 | Core Responsibility                                        |
| :--------------------- | :--------------------------------------------------------- |
| **`auth/`**            | Login, Register, Forgot Password, OTP verification         |
| **`user/`**            | Account settings, general user profile management          |
| **`parent/`**          | Parent verification, parenting preferences, badges         |
| **`child/`**           | Child profiles, age groups, interest tags, special notes   |
| **`discovery/`**       | Nearby peer matchmaking, location filters, child matching  |
| **`playdate/`**        | Invitation creation, reschedule requests, date scheduling  |
| **`chat/`**            | Realtime conversation list, 1-on-1 parent messaging, media |
| **`ai-assistant/`**    | AI activity recommendations, safe play venue suggestions   |
| **`notification/`**    | In-app alerts, playdate status updates, reminders          |
| **`safety/`**          | Report suspicious activity, block accounts, safety tips    |
| **`gamification/`**    | Weekly playdate streak, achievement badges, unlock popup   |
| **`subscription/`**    | Membership plans, quota usage, PayOS payment checkout      |
| **`rating-feedback/`** | Post-playdate review, parent ratings, testimonials         |
| **`admin/`**           | Management dashboard, content moderation, reports          |

---

## 📦 Single Module Structure

Each module in `src/modules/<feature>/` is self-contained:

```text
modules/playdate/
├── api/             # API request functions (playdateApi.js)
├── hooks/           # Domain-specific custom hooks (usePlaydate.js)
├── redux/           # Redux slice or RTK Query endpoints (playdateSlice.js)
├── pages/           # Page views for this module (PlaydateListPage.jsx)
├── components/      # Feature-specific subcomponents (PlaydateCard.jsx)
├── validation/      # Form validation schemas (Yup / Zod schema)
└── constants/       # Module constants & status enums (playdateConstants.js)
```

---

## 🔄 Data & Control Flow

```text
User Interaction (Page / Component)
      │
      ▼
Domain Custom Hook (e.g. usePlaydate, useChat)
      │
      ▼
Redux State / RTK Query / Cache
      │
      ├───────────────────────────────┐
      ▼                               ▼
REST API (apiClient.js)     Realtime (Socket.io)
      │                               │
      └───────────────┬───────────────┘
                      ▼
             BuddyLink Backend API
```
