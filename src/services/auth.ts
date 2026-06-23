import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from "firebase/auth";

import { trackEvent } from "@/services/analytics";
import { captureError, finishTrace, startTrace } from "@/services/monitoring";
import { firebaseAuth, isFirebaseConfigured } from "@/services/firebase";

function requireAuth() {
  if (!firebaseAuth) {
    throw new Error(
      isFirebaseConfigured
        ? "Firebase Auth is not available yet. Restart Expo after updating dependencies or config."
        : "Firebase Auth is not configured. Add EXPO_PUBLIC_FIREBASE_* values to a local .env file before signing in."
    );
  }

  return firebaseAuth;
}

export async function signInWithEmail(email: string, password: string) {
  const trace = startTrace("auth_sign_in");
  await trackEvent("auth_started", {
    method: "email"
  });
  const auth = requireAuth();
  try {
    const result = await signInWithEmailAndPassword(auth, email.trim(), password);
    const durationMs = await finishTrace(trace, { method: "email" });
    await trackEvent("auth_succeeded", {
      method: "email",
      is_new_user: false,
      duration_ms: durationMs
    });
    return result.user;
  } catch (error) {
    await captureError("Auth sign-in failed", error, { method: "email" });
    await trackEvent("auth_failed", {
      method: "email",
      error_code: error instanceof Error ? error.message : "auth_failed"
    });
    throw error;
  }
}

export async function signUpWithEmail(email: string, password: string, displayName: string) {
  const trace = startTrace("auth_sign_up");
  await trackEvent("auth_started", {
    method: "email_create"
  });
  const auth = requireAuth();
  try {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), password);

    if (displayName.trim()) {
      await updateProfile(result.user, { displayName: displayName.trim() });
    }

    const durationMs = await finishTrace(trace, { method: "email_create" });
    await trackEvent("auth_succeeded", {
      method: "email_create",
      is_new_user: true,
      duration_ms: durationMs
    });
    return result.user;
  } catch (error) {
    await captureError("Auth sign-up failed", error, { method: "email_create" });
    await trackEvent("auth_failed", {
      method: "email_create",
      error_code: error instanceof Error ? error.message : "auth_failed"
    });
    throw error;
  }
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
