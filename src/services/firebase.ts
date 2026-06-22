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

const firebaseConfig = extra?.firebase;

export const firebaseApp =
  firebaseConfig && getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0] ?? null;

void AsyncStorage;

export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;

export const firebaseDb = firebaseApp ? getFirestore(firebaseApp) : null;
