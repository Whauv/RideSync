import Constants from "expo-constants";
import { initializeApp, getApps } from "firebase/app";

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

const firebaseConfig = extra?.firebase;

export const firebaseApp =
  firebaseConfig && getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0] ?? null;
