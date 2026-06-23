import { PropsWithChildren, useEffect } from "react";

import { recordDiagnosticEvent } from "@/services/diagnostics";
import { getPlatformCapabilities } from "@/services/platform";

export function DevelopmentSurfaceBootstrap({ children }: PropsWithChildren) {
  useEffect(() => {
    const capabilities = getPlatformCapabilities();

    if (!capabilities.webFirstMode) {
      return;
    }

    void recordDiagnosticEvent({
      category: "app",
      level: "info",
      title: "Web-first development mode active",
      detail: "Browser-safe map, voice, permissions, and notification adapters are active for shared product development.",
      context: {
        mapMode: capabilities.mapMode,
        voiceMode: capabilities.voiceMode,
        notificationMode: capabilities.notificationMode
      }
    });
  }, []);

  return children;
}
