import AsyncStorage from "@react-native-async-storage/async-storage";

import { DiagnosticEvent } from "@/types/runtime";

const DIAGNOSTIC_STORAGE_KEY = "ridesync-diagnostic-events";

function buildId() {
  return `diag-${Math.random().toString(36).slice(2, 10)}`;
}

export async function recordDiagnosticEvent(event: Omit<DiagnosticEvent, "id" | "createdAt">) {
  const raw = await AsyncStorage.getItem(DIAGNOSTIC_STORAGE_KEY);
  const existing = raw ? (JSON.parse(raw) as DiagnosticEvent[]) : [];
  const next: DiagnosticEvent[] = [
    {
      id: buildId(),
      createdAt: new Date().toISOString(),
      ...event
    },
    ...existing
  ].slice(0, 250);

  await AsyncStorage.setItem(DIAGNOSTIC_STORAGE_KEY, JSON.stringify(next));
}

export async function readDiagnosticEvents() {
  const raw = await AsyncStorage.getItem(DIAGNOSTIC_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as DiagnosticEvent[]) : [];
}

export async function clearDiagnosticEvents() {
  await AsyncStorage.removeItem(DIAGNOSTIC_STORAGE_KEY);
}

export function getCrashReportingStatus() {
  return {
    enabled: false,
    provider: "placeholder",
    note: "Crash reporting is scaffolded for diagnostics review, but no production crash backend is configured in this build."
  };
}
