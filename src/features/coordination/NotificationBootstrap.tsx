import { PropsWithChildren, useEffect } from "react";

import { configureCoordinationNotifications } from "@/services/coordination";

export function NotificationBootstrap({ children }: PropsWithChildren) {
  useEffect(() => {
    void configureCoordinationNotifications();
  }, []);

  return children;
}
