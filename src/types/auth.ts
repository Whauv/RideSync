export type PreferredUnits = "imperial" | "metric";

export type PermissionStatus = "unknown" | "granted" | "denied" | "blocked" | "unavailable";

export interface EmergencyContact {
  name: string;
  phone: string;
}

export interface MedicalProfile {
  bloodType: string;
  allergies: string;
  conditions: string;
  medications: string;
  notes: string;
  shareWithRideLeaders: boolean;
}

export interface RiderProfile {
  riderName: string;
  bikeName: string;
  avatarInitials: string;
  emergencyContact: EmergencyContact;
  preferredUnits: PreferredUnits;
  bikeBrand?: string;
  intercomBrand?: string;
  medicalProfile: MedicalProfile;
}

export interface PermissionState {
  location: PermissionStatus;
  microphone: PermissionStatus;
  notifications: PermissionStatus;
  audio: PermissionStatus;
}

export interface AuthIdentity {
  uid: string;
  email: string | null;
}
