import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { firebaseDb } from "@/services/firebase";
import { RiderProfile } from "@/types/auth";

export async function saveRiderProfile(userId: string, profile: RiderProfile) {
  if (!firebaseDb) {
    return;
  }

  await setDoc(
    doc(firebaseDb, "users", userId),
    {
      ...profile,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

export async function loadRiderProfile(userId: string) {
  if (!firebaseDb) {
    return null;
  }

  const snapshot = await getDoc(doc(firebaseDb, "users", userId));
  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as RiderProfile;
}
