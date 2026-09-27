# BuddyLink Frontend Convention

Coding standards, directory naming, and architectural conventions for the **BuddyLink Frontend** application.

---

## 🏷️ Naming Conventions

### 1. Components, Pages & Layouts
Use **PascalCase** for files containing JSX elements:
- Pages: `PlaydateListPage.jsx`, `ChildProfilePage.jsx`, `ChatRoomPage.jsx`
- Components: `PlaydateCard.jsx`, `ParentVerificationBadge.jsx`, `ChildInterestChip.jsx`
- Layouts: `AuthLayout.jsx`, `MainLayout.jsx`, `DashboardLayout.jsx`

### 2. Custom Hooks
Use **camelCase** and MUST start with the prefix `use`:
- Global hooks: `useDebounce.js`, `useMediaQuery.js`, `useToast.js`
- Feature hooks: `usePlaydate.js`, `useChatMessages.js`, `useChildProfile.js`

### 3. Redux Slices & Services
Use **camelCase** with explicit functional suffixes:
- Redux Toolkit slices: `authSlice.js`, `playdateSlice.js`, `chatSlice.js`
- API services: `authApi.js`, `playdateApi.js`, `chatApi.js`, `aiApi.js`

### 4. Utilities & Helpers
Use **camelCase**:
- `formatDate.js`, `validateChildAge.js`, `distanceCalculator.js`

### 5. Constants & Enums
Use **SCREAMING_SNAKE_CASE** for constant variables and files:
- Variables: `PLAYDATE_STATUS = { PENDING: 'PENDING', CONFIRMED: 'CONFIRMED' }`
- Files: `playdate.constants.js`, `storage.constants.js`

---

## 📄 File Extension Conventions

| Extension | Permitted Contents |
| :--- | :--- |
| **`.jsx`** | React components, Pages, Layouts, Context Providers (anything with JSX) |
| **`.js`** | Custom hooks, Redux slices, API services, utilities, config, constants |
| **`.css`** | Global stylesheets, Tailwind directive imports, custom design tokens |

---

## 🧩 Shared vs. Module Component Rules

### Shared Reusable UI (`src/components/`)
- Contains **pure, reusable, dumb** UI primitives.
- Must follow the **BuddyLink Design System** tokens (`DESIGN.md`).
- **Forbidden**: Business logic, API calls, Redux dispatching to specific feature state.
- *Examples*: `Button/`, `Modal/`, `Input/`, `Badge/`, `Avatar/`, `Skeleton/`

### Module-Specific UI (`src/modules/<feature>/components/`)
- Contains domain-specific components tied to a specific business feature.
- May use module hooks or dispatch module actions.
- *Examples*: `PlaydateCard.jsx`, `ChildActivityPicker.jsx`, `ChatMessageBubble.jsx`

---

## 🪝 Hook Rules

### Global Shared Hooks (`src/hooks/`)
- Generic utilities completely decoupled from business domain.
- *Examples*: `useClickOutside.js`, `useLocalStorage.js`, `useSocketEvent.js`

### Feature Hooks (`src/modules/<feature>/hooks/`)
- Encapsulates business logic, data fetching, and state management for that feature.
- *Examples*: `usePlaydateMatching.js`, `useChatRoom.js`

---

## 🌐 Network & API Rules

1. **Centralized Client**: All API requests MUST go through `services/apiClient.js`.
2. **Never Call Axios Directly in Components**:
   - ❌ `useEffect(() => { axios.get('/api/v1/playdates') }, [])`
   - ✅ Call domain API methods via custom hooks or RTK Query:
     ```javascript
     // modules/playdate/api/playdateApi.js
     import apiClient from '@/services/apiClient';

     export const getPlaydates = (params) => apiClient.get('/playdates', { params });
     ```
3. **Socket.io Realtime Rule**: All websocket listeners and emissions MUST be encapsulated through `services/socket.js` or dedicated custom hooks (e.g. `useChatSocket.js`), never created on-the-fly in UI components.

---

## 🎨 Styling & Design System Rules

1. **Design System First**: Adhere to token variables defined in `DESIGN.md`:
   - Primary: Soft Matcha Green (`#7BAE7F`)
   - Secondary: Soft Cloud Blue (`#92C5DE`)
   - Tertiary: Warm Butter Yellow (`#F6D186`)
   - Font: **Plus Jakarta Sans**
2. **Avoid Hardcoded Magic Values**: Use Tailwind theme classes mapped to design tokens rather than arbitrary hex colors inline.
3. **Consistent Radii**:
   - Buttons & Inputs: `rounded-xl` (12px–14px)
   - Cards: `rounded-2xl` (16px–20px)
   - Badges & Pills: `rounded-full` (9999px)