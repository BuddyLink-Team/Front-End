import { initializeApp, getApps } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if valid Firebase configuration is provided (not empty and not placeholder)
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'AIzaSyDummyKeyForPhoneAuthIfEmpty' &&
  !firebaseConfig.apiKey.includes('Dummy') &&
  firebaseConfig.projectId
);

let app = null;
let auth = null;

export const getFirebaseAuth = () => {
  if (!isFirebaseConfigured) return null;
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    auth.useDeviceLanguage();
  }
  return auth;
};

/**
 * Setup Invisible RecaptchaVerifier for Phone Auth
 * @param {string} containerId - Element ID for recaptcha container
 * @returns {RecaptchaVerifier|null}
 */
export const initRecaptchaVerifier = (containerId = 'recaptcha-container') => {
  const authInstance = getFirebaseAuth();
  if (!authInstance) return null;

  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch {
      // ignore
    }
  }

  window.recaptchaVerifier = new RecaptchaVerifier(authInstance, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved - will proceed with phone auth
    },
    'expired-callback': () => {
      // Response expired. Ask user to solve reCAPTCHA again.
    },
  });

  return window.recaptchaVerifier;
};

/**
 * Send Firebase SMS OTP to phone number
 * @param {string} phoneNumber - E.164 formatted (+84...) or standard VN format
 * @param {RecaptchaVerifier} appVerifier
 * @returns {Promise<ConfirmationResult>}
 */
export const sendFirebasePhoneOtp = async (phoneNumber, appVerifier) => {
  const authInstance = getFirebaseAuth();
  if (!authInstance) {
    throw new Error('Firebase chưa được cấu hình API Key hợp lệ');
  }

  // Normalize Vietnam phone format: 0908123456 -> +84908123456
  let formattedPhone = phoneNumber.trim().replace(/\s+/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '+84' + formattedPhone.slice(1);
  } else if (!formattedPhone.startsWith('+')) {
    formattedPhone = '+84' + formattedPhone;
  }

  const verifier = appVerifier || initRecaptchaVerifier();
  return await signInWithPhoneNumber(authInstance, formattedPhone, verifier);
};

export default app;
