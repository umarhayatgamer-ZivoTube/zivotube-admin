import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim(),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim()
};

// Initialize Firebase only if essential keys are present
const isConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId;

const app: FirebaseApp | undefined = isConfigValid
    ? (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig))
    : undefined;

// Export with null checks to avoid client-side crashes
export const db: Firestore = app ? getFirestore(app) : (null as any);
export const auth: Auth = app ? getAuth(app) : (null as any);

export { app };

export const getMessagingInstance = async () => {
    if (typeof window === 'undefined' || !app) return null;
    try {
        const { getMessaging, isSupported } = await import("firebase/messaging");
        const supported = await isSupported();
        return supported ? getMessaging(app) : null;
    } catch (err) {
        console.error("Failed to initialize Firebase Messaging:", err);
        return null;
    }
};
