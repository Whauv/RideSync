import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from "firebase/auth";

import { firebaseAuth } from "@/services/firebase";

function requireAuth() {
  if (!firebaseAuth) {
    throw new Error("Firebase Auth is not configured. Add Firebase config to Expo extras before signing in.");
  }

  return firebaseAuth;
}

export async function signInWithEmail(email: string, password: string) {
  const auth = requireAuth();
  const result = await signInWithEmailAndPassword(auth, email.trim(), password);
  return result.user;
}

export async function signUpWithEmail(email: string, password: string, displayName: string) {
  const auth = requireAuth();
  const result = await createUserWithEmailAndPassword(auth, email.trim(), password);

  if (displayName.trim()) {
    await updateProfile(result.user, { displayName: displayName.trim() });
  }

  return result.user;
}

export async function signOutUser() {
  const auth = requireAuth();
  await signOut(auth);
}

export function subscribeToAuthState(listener: (user: User | null) => void) {
  if (!firebaseAuth) {
    listener(null);
    return () => undefined;
  }

  return onAuthStateChanged(firebaseAuth, listener);
}
