/**
 * Which portal this build serves. Set at build time: `npm run dev:admin` / `npm run build:admin`
 * load .env.admin (VITE_APP_TARGET=admin), every other script builds the parent app.
 * The admin portal talks to the admin API (own port/service) through VITE_API_URL.
 */
export const IS_ADMIN_PORTAL = import.meta.env.VITE_APP_TARGET === 'admin';
