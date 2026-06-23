import { recordDiagnosticEvent } from "@/services/diagnostics";

interface TraceHandle {
  name: string;
  startedAt: number;
}

export function startTrace(name: string): TraceHandle {
  return {
    name,
    startedAt: Date.now()
  };
}

export async function finishTrace(handle: TraceHandle, context?: Record<string, string | number | boolean | null | undefined>) {
  const durationMs = Date.now() - handle.startedAt;
  await recordDiagnosticEvent({
    category: "app",
    level: durationMs > 2000 ? "warning" : "info",
    title: `Trace: ${handle.name}`,
    detail: `${durationMs}ms`,
    context: {
      durationMs,
      ...context
    }
  });

  return durationMs;
}

export async function captureError(
  title: string,
  error: unknown,
  context?: Record<string, string | number | boolean | null | undefined>
) {
  await recordDiagnosticEvent({
    category: "app",
    level: "error",
    title,
    detail: error instanceof Error ? error.message : String(error),
    context
  });
}
