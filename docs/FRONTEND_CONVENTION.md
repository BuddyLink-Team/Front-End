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

## ⚠️ API Error Message Rules

1. **Module Error Map**: Each module maps the backend error codes its endpoints return to Vietnamese messages in its own constants file, as `<MODULE>_ERROR_MESSAGES`:
   ```javascript
   // modules/connection/constants/connection.constants.js
   export const CONNECTION_ERROR_MESSAGES = Object.freeze({
     CONNECTION_NOT_FOUND: 'Không tìm thấy kết nối này.',
     INVALID_CONNECTION_STATE: 'Lời mời này đã được xử lý trước đó.',
   });
   ```
2. **Common Errors Are Shared**: Codes returned by every endpoint (auth, role, rate limit, validation, network, timeout, ...) already live in `COMMON_ERROR_MESSAGES` (`src/constants/error.constants.js`). Do not repeat them in module maps; add new shared codes there instead.
3. **Resolve Messages in Hooks with `getApiErrorMsg`**: Hooks get the user-facing message through `getApiErrorMsg(errorMap, err, fallback)` from `src/utils/errorUtils.js` (module map → common map → fallback). Use `getErrorCode(err)` when logic must branch on a specific code.
   - ❌ `toast.error(err.message)` / `toast.error('Không thể kết nối.')` for an API failure / `throw new Error('...')` with a hard-coded message
   - ✅
     ```javascript
     toast.error(getApiErrorMsg(CONNECTION_ERROR_MESSAGES, err, 'Thao tác không thành công. Vui lòng thử lại.'));
     ```
4. **Never Show the Backend's English Message**: Unmapped codes fall back to the Vietnamese `fallback`; when the backend adds a new code, add it to the module map (or the common map).

---

## 🎨 Styling & Design System Rules

1. **Design System First**: Adhere to token variables defined in `DESIGN.md`:
   - Primary: Soft Matcha Green (`#7BAE7F`)
   - Secondary: Soft Cloud Blue (`#92C5DE`)
   - Tertiary: Warm Butter Yellow (`#F6D186`)
   - Font: **Plus Jakarta Sans**
2. **No Hardcoded Values** — every color, size, shadow, z-index, stroke, scale, duration… comes from `tailwind.config.js`:
   - ❌ Arbitrary values: `text-[10px]`, `max-w-[620px]`, `shadow-[0_1px_8px_rgba(0,0,0,0.03)]`, `z-[200]`, `stroke-[1.75]`, `scale-[0.98]`, hex colors.
   - ✅ Stock Tailwind scale (`w-4`, `max-w-md`, `z-50`, `scale-95`) or a named token (`text-label-xs`, `max-w-otp-card`, `shadow-header`, `z-overlay`, `stroke-1.75`, `scale-98`).
   - No matching value? **Add a named token** to `theme.extend` in `tailwind.config.js` (name it by role: `max-w-shell`, `min-h-page`, `w-chat-panel`), then use the class. Never fall back to `[...]`.
   - **Custom CSS** (`src/styles/*.css`): read values with `theme()` — `theme('colors.surface.dim')`, `theme('spacing.6')`, `theme('colors.hairline / 85%')`, `theme('boxShadow.popover')`. No raw hex / rgba / px.
   - **Numeric JS props** (Lucide `size` / `strokeWidth`, chart or QR sizes): use constants, e.g. `ICON_SIZE.MD`, `ICON_STROKE.DEFAULT` from `constants/icon.constants.js`; module-specific sizes live in the module's constants (`QR_CODE_SIZE`).
   - Allowed exceptions: values computed at runtime (`style={{ width: \`${percent}%\` }}`, drag offsets) and third-party brand assets (Google logo colors in `GoogleLoginButton`).
3. **Consistent Radii**:
   - Buttons & Inputs: `rounded-xl` (12px–14px)
   - Cards: `rounded-2xl` (16px–20px)
   - Badges & Pills: `rounded-full` (9999px)
4. **Merging Classes with `cn()`** (`utils/cn.js`):
   - Use `cn()` whenever classes are combined conditionally or a component accepts a `className` override. Later classes win over earlier conflicting ones (`cn('px-3 text-sm', 'px-space-md text-label-md')` → `px-space-md text-label-md`).
   - `cn()` reads the custom tokens straight from `tailwind.config.js` (`theme.extend`), so tailwind-merge understands them and **new tokens work automatically** — no need to touch `cn.js`.
   - Covered theme keys: `spacing`, `fontSize`, `boxShadow`, `borderRadius`, `borderWidth`, `width`, `height`, `minWidth`, `minHeight`, `maxWidth`, `maxHeight`, `gridTemplateColumns`, `zIndex`, `strokeWidth`, `scale`, `textUnderlineOffset`, `transitionTimingFunction`, `transitionDuration` (mapping in `TOKEN_GROUPS`). ⚠️ If you add tokens under a **new** theme key, add that key to `TOKEN_GROUPS` in `utils/cn.js`; otherwise tailwind-merge may misread it (a font size like `text-foo` is taken for a text color and dropped next to `text-white`; `max-w-foo` is kept alongside `max-w-md` instead of replacing it).
   - Do not import `twMerge` from `tailwind-merge` directly; always go through `cn()`.