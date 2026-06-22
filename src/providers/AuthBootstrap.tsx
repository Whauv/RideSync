import { PropsWithChildren, useEffect } from "react";

import { subscribeToAuthState } from "@/services/auth";
import { loadRiderProfile } from "@/services/profile";
import { useAppStore } from "@/store/useAppStore";

export function AuthBootstrap({ children }: PropsWithChildren) {
  const setAuthBootstrapped = useAppStore((state) => state.setAuthBootstrapped);
  const setAuthIdentity = useAppStore((state) => state.setAuthIdentity);
  const clearAuthIdentity = useAppStore((state) => state.clearAuthIdentity);
  const mergeProfile = useAppStore((state) => state.mergeProfile);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (user) => {
      if (user) {
        setAuthIdentity({
          uid: user.uid,
          email: user.email
        });

        const profile = await loadRiderProfile(user.uid);
        if (profile) {
          mergeProfile(profile);
        }
      } else {
        clearAuthIdentity();
      }

      setAuthBootstrapped(true);
    });

    return unsubscribe;
  }, [clearAuthIdentity, mergeProfile, setAuthBootstrapped, setAuthIdentity]);

  return children;
}
