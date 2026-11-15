import { StateCreator } from "zustand";

import { PermissionState } from "@/types/auth";

import { defaultPermissions } from "../defaults";
import { AppState } from "../types";

export interface PermissionsSlice {
  permissions: PermissionState;
  updatePermission: (key: keyof PermissionState, value: PermissionState[keyof PermissionState]) => void;
  resetPermissions: () => void;
}

export const createPermissionsSlice: StateCreator<AppState, [], [], PermissionsSlice> = (set) => ({
  permissions: defaultPermissions,
  updatePermission: (key, value) =>
    set((state) => ({
      permissions: {
        ...state.permissions,
        [key]: value
      }
    })),
  resetPermissions: () => set({ permissions: defaultPermissions })
});
