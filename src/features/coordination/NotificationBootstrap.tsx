import { PropsWithChildren, useEffect } from "react";

import { configureCoordinationNotifications } from "@/services/coordination";
import { deviceNotifications } from "@/services/deviceNotifications";
import { recordDiagnosticEvent } from "@/services/diagnostics";

export function NotificationBootstrap({ children }: PropsWithChildren) {
  useEffect(() => {
    void configureCoordinationNotifications();

    const receiveSubscription = deviceNotifications.addReceivedListener((notification) => {
      const payload = notification as {
        request?: {
          content?: {
            title?: string | null;
            data?: Record<string, unknown>;
          };
        };
      };

      void recordDiagnosticEvent({
        category: "notification",
        level: "info",
        title: "Notification received",
        detail: payload.request?.content?.title ?? "Ride event received.",
        context: {
          kind: String(payload.request?.content?.data?.kind ?? "unknown")
        }
      });
    });

    const responseSubscription = deviceNotifications.addResponseListener((response) => {
      const payload = response as {
        actionIdentifier?: string;
        notification?: {
          request?: {
            content?: {
              title?: string | null;
              data?: Record<string, unknown>;
            };
          };
        };
      };

      void recordDiagnosticEvent({
        category: "notification",
        level: "info",
        title: "Notification opened",
        detail: payload.notification?.request?.content?.title ?? "Ride notification opened.",
        context: {
          actionIdentifier: payload.actionIdentifier,
          kind: String(payload.notification?.request?.content?.data?.kind ?? "unknown")
        }
      });
    });

    return () => {
      receiveSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return children;
}
