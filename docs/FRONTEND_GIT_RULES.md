# BuddyLink Frontend Git Rules & Workflow

This document establishes the mandatory Git workflow, branch naming strategy, commit message standards, and pull request procedures for the **BuddyLink Frontend** repository.

---

## 🌿 1. Branch Strategy

All development branches are created directly from the primary branch: **`main`**.

### Branch Hierarchy

```text
main (Primary production & integration branch, protected)
  ▲
  │ (Pull Request after tests pass & code review)
feature/BUD-101-guest-landing-page
fix/BUD-102-navbar-dropdown-cutoff
refactor/BUD-103-simplify-toast-notifications
```

### Branch Naming Conventions

Use lowercase letters, numbers, and hyphens (`-`). Prefix each branch with its intent and the project ticket code **`BUD-<number>`**:

| Prefix | Use Case | Example |
| :--- | :--- | :--- |
| `feature/` | Developing a new UI component, page, or integration | `feature/BUD-101-landing-page`<br>`feature/BUD-24-child-matching-card` |
| `fix/` | Resolving a bug or UI rendering defect | `fix/BUD-102-modal-backdrop-scrolling`<br>`fix/BUD-52-chat-input-overflow` |
| `refactor/` | Code cleanup, optimization, or architecture update | `refactor/BUD-103-shared-components-barrel`<br>`refactor/BUD-60-redux-auth-slice` |
| `style/` | CSS, Tailwind design system token tweaks | `style/BUD-70-matcha-color-palette` |
| `docs/` | Updating documentation, README, guides | `docs/BUD-80-sync-frontend-components` |
| `test/` | Adding or updating unit/integration tests | `test/BUD-90-add-playdate-card-tests` |
| `hotfix/` | Urgent fixes pushed directly to `main` | `hotfix/BUD-99-blank-screen-on-reload` |

---

## ✍️ 2. Conventional Commit Standards

Every commit message MUST follow the **Conventional Commits** specification:

```text
<type>(<scope>): <short description in imperative mood>

[optional body with details/rationale]

[optional footer(s), e.g., Closes #123, BREAKING CHANGE]
```

### Allowed Types

- **`feat`**: A new user-facing feature or component (e.g. `feat(landing): add guest hero section and cta`).
- **`fix`**: A bug fix (e.g. `fix(auth): prevent infinite redirect loop on logout`).
- **`refactor`**: Code changes that neither fix a bug nor add a feature (e.g. `refactor(ui): extract custom checkbox component`).
- **`style`**: Changes that do not affect code logic (formatting, Tailwind styling, whitespace).
- **`docs`**: Documentation only changes (e.g. `docs(shared): update props table for StatCard`).
- **`test`**: Adding missing tests or correcting existing tests.
- **`chore`**: Build process, tool configurations, package upgrades (e.g. `chore(deps): update vite to v5.4`).
- **`perf`**: A code change that improves performance.

### Permitted Frontend Scopes

| Scope | Description |
| :--- | :--- |
| `ui` | Shared UI primitives in `src/components/ui/` (`Button`, `Input`, `Switch`, etc.) |
| `components` | Badges, Cards, Feedback dialogs, Navigation components |
| `landing` | Guest Landing Page and promotional sections |
| `auth` | Login, Register, Password Recovery, OTP verification |
| `discovery` | Peer finding, matchmaking, and child swipe cards |
| `playdate` | Playdate creation, rescheduling, invitation cards |
| `chat` | 1-1 parent chat, playdate group messaging, realtime sockets |
| `ai` | AI Assistant agent prompt, activity suggestions |
| `safety` | Account reporting, blocking, safety tips |
| `gamification` | Streaks, Badges, achievement popup |
| `subscription` | Membership plans, PayOS checkout |
| `admin` | Admin dashboard, content moderation |
| `router` | `appRoutes.jsx`, route guards (`ProtectedRoute`, `RoleRoute`) |
| `services` | `apiClient.js`, `socket.js` |
| `docs` | Changes inside `docs/` |

### Commit Examples

✅ **Good Commits**:
- `feat(landing): add guest hero section and matchmaking preview card`
- `fix(router): allow unauthenticated guests to view landing page at /`
- `refactor(feedback): remove redundant Toast.jsx and configure Toaster in App.jsx`
- `docs(components): update component checklist and add switch specs`
- `test(hooks): add unit tests for useDebounce and usePagination`

❌ **Bad Commits**:
- `fixed stuff` *(vague, no type, no scope)*
- `WIP` *(never push temporary WIP commits to shared branches)*
- `update code` *(unclear intent)*
- `Fixed bug in component` *(past tense, non-standard format)*

---

## 🛡️ 3. Pre-Commit Verification Checklist

Before running `git commit`, each developer must guarantee:

1. **Build passes clean**:
   ```bash
   npm run build
   ```
2. **Linting & Formatting**:
   ```bash
   npm run lint
   ```
3. **No secrets or `.env` checked in**:
   - Verify `git status` does **not** stage `.env` or local API keys.
   - Keep `.env.example` updated with mock placeholders.
4. **No leftover debug artifacts**:
   - Remove `console.log(...)`, commented-out legacy code blocks, or unused imports.

---

## 🔀 4. Pull Request (PR) & Code Review Guidelines

1. **Title**: Follow conventional commit syntax (e.g., `feat(landing): build guest landing page with responsive design`).
2. **Description Template**:
   - **Summary**: Concise bullet points explaining what was changed and why.
   - **Screenshots / GIF**: Mandatory for any visible UI / component additions.
   - **Testing Performed**: Commands run (`npm run build`, `npm test`) and verified viewports (Mobile `<768px`, Desktop `>1024px`).
3. **Review Requirements**:
   - Minimum **1 approving review** from a team member.
   - All CI checks (build, tests) must pass.
4. **Merge Method**:
   - **Squash and Merge** (preferred for feature branches to keep `develop` history clean).
   - Commit message on squash must summarize the completed feature cleanly.

---

## 🚨 5. Golden Rules for Developers

- **Never force push (`git push --force`)** to `main`.
- **Atomic Commits**: Group related changes together. Avoid committing unrelated UI changes and API refactors in one giant commit.
- **Never commit generated folders**: `dist/`, `node_modules/`, `.vite/`, coverage reports.
- **Pull with rebase**: Before opening a PR or merging, pull latest `main` with:
  ```bash
  git pull --rebase origin main
  ```
