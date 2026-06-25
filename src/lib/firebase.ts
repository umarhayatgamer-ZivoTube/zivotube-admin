import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase only if API key is present to prevent build errors
const app: FirebaseApp | undefined = firebaseConfig.apiKey
    ? (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig))
    : undefined;

export const db: Firestore = app ? getFirestore(app) : ({} as Firestore);
export const auth: Auth = app ? getAuth(app) : ({} as Auth);

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
