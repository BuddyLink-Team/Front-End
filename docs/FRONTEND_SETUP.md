# BuddyLink Frontend Setup

Guide for setting up and running the **BuddyLink Frontend** web application.

---

## 🚀 Prerequisites

- **Node.js**: `>= 20.0.0` (Recommended `v22.x LTS`)
- **Package Manager**: npm (`>= 10.0.0`)
- **BuddyLink Backend**: Parent API at `http://localhost:5000`, admin API at `http://localhost:5001` (`ADMIN_PORT`)

---

## 🛠️ Installation & Setup

### 1. Navigate to Frontend Directory

```bash
cd Front-End
```

### 2. Install Dependencies

```bash
npm install
```

---

## ⚙️ Environment Variables

Create `.env` file in the frontend root by copying `.env.example`:

```bash
cp .env.example .env
```

### Configuration:

```env
# Backend API Endpoint
VITE_API_URL=http://localhost:5000/api/v1

# Realtime Socket Server
VITE_SOCKET_URL=http://localhost:5000

# Client App Port / URL
VITE_PORT=5173

# Google OAuth 2.0 Client ID (Web Application)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# Firebase Phone Auth / SMS Verification
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Admin portal (`.env.admin`)

The admin portal is a separate build of the same code. `--mode admin` loads `.env` first, then `.env.admin` overrides it:

```bash
cp .env.admin.example .env.admin
```

```env
VITE_APP_TARGET=admin
VITE_API_URL=http://localhost:5001/api/v1/admin
```

---

## 🏃 Run Application

### Development Mode (with Vite HMR)

```bash
npm run dev
```

> Application runs at: **http://localhost:5173**

### Admin Portal (Development)

```bash
npm run dev:admin
```

> Admin portal runs at: **http://localhost:5174** (talks to the admin API on port 5001)

### Build for Production

```bash
npm run build          # Parent app  -> dist/
npm run build:admin    # Admin portal -> dist-admin/
```

### Preview Production Build

```bash
npm run preview
npm run preview:admin
```

### Deploy on Vercel

Create **two Vercel projects** from this repository (`vercel.json` rewrites every path to `index.html` for client-side routing):

| Project | Build command | Output directory | Environment variables |
|---|---|---|---|
| Parent app | `npm run build` | `dist` | Same as `.env`, `VITE_API_URL=https://<parent-api>.onrender.com/api/v1` |
| Admin portal | `npm run build:admin` | `dist-admin` | `VITE_APP_TARGET=admin`, `VITE_API_URL=https://<admin-api>.onrender.com/api/v1/admin` |

Full guide (Render + Vercel, all env variables, checklist): `Back-End/docs/DEPLOYMENT.md` in the Back-End repository.

`.env.admin` is not committed, so the admin variables must be set in the Vercel dashboard. Set the backend `CLIENT_URL` / `ADMIN_CLIENT_URL` to the two Vercel URLs.

### Testing (Vitest & React Testing Library)

```bash
# Run unit & component tests in watch mode
npm test

# Run all tests once
npx vitest run

# Run tests in interactive UI mode
npm run test:ui
```

---

## 📦 Core Technology Stack & Libraries

Libraries configured in `package.json`:

- **UI & Routing**:
  - `react`, `react-dom` (React 18)
  - `react-router-dom` (Routing, Route Guards, Lazy Loading)
  - `lucide-react` (Line icons matching Design System)
- **State Management & Network**:
  - `@reduxjs/toolkit`, `react-redux` (Global State in `app/store.js`)
  - `axios` (Centralized `apiClient.js` with auto JWT header & refresh)
  - `socket.io-client` (Realtime chat & notifications via `socket.js`)
- **Form & Validation**:
  - `react-hook-form`
  - `zod`
- **Testing**:
  - `vitest`, `jsdom`
  - `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
- **Utilities & UI Polish**:
  - `dayjs` (Date/time handling)
  - `react-hot-toast` (Notification toasts)
- **Styling**:
  - `tailwindcss`, `postcss`, `autoprefixer`
  - `clsx`, `tailwind-merge` (`cn.js`)

---

## 💻 Recommended VSCode Extensions

- **Tailwind CSS IntelliSense** (Auto-complete for utility classes)
- **ESLint** & **Prettier - Code formatter**
- **Error Lens** (In-line diagnostics)
- **GitLens** (Git blame & revisions)
- **Path IntelliSense** (Auto-complete file imports)
