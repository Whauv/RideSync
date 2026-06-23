import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const extra = Constants.expoConfig?.extra as
  | {
      firebase?: {
        apiKey: string;
        authDomain: string;
        projectId: string;
        storageBucket: string;
        messagingSenderId: string;
        appId: string;
      };
    }
  | undefined;

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? extra?.firebase?.apiKey ?? "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? extra?.firebase?.authDomain ?? "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? extra?.firebase?.projectId ?? "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? extra?.firebase?.storageBucket ?? "",
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? extra?.firebase?.messagingSenderId ?? "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? extra?.firebase?.appId ?? ""
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

export const firebaseApp =
  isFirebaseConfigured && getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0] ?? null;

void AsyncStorage;

export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;

export const firebaseDb = firebaseApp ? getFirestore(firebaseApp) : null;
