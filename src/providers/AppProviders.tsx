import { PropsWithChildren, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthBootstrap } from "@/providers/AuthBootstrap";
import { ThemeProvider } from "@/design/ThemeProvider";
import { NotificationBootstrap } from "@/features/coordination/NotificationBootstrap";
import { MusicBootstrap } from "@/features/music/MusicBootstrap";
import { ResilienceBootstrap } from "@/features/resilience/ResilienceBootstrap";
import { AnalyticsBootstrap } from "@/providers/AnalyticsBootstrap";
import { DevelopmentSurfaceBootstrap } from "@/providers/DevelopmentSurfaceBootstrap";
import { MonitoringBoundary } from "@/providers/MonitoringBoundary";
import { VoiceBootstrap } from "@/features/voice/VoiceBootstrap";
import { ToastProvider } from "@/providers/ToastProvider";

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15000,
            retry: 1
          }
        }
      })
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <NotificationBootstrap>
              <ToastProvider>
                <AuthBootstrap>
                  <AnalyticsBootstrap>
                    <DevelopmentSurfaceBootstrap>
                      <ResilienceBootstrap>
                        <VoiceBootstrap>
                          <MusicBootstrap>
                            <MonitoringBoundary>{children}</MonitoringBoundary>
                          </MusicBootstrap>
                        </VoiceBootstrap>
                      </ResilienceBootstrap>
                    </DevelopmentSurfaceBootstrap>
                  </AnalyticsBootstrap>
                </AuthBootstrap>
              </ToastProvider>
            </NotificationBootstrap>
          </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
