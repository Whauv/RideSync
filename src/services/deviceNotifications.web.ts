import { NotificationBridge, NotificationBridgePayload } from "@/types/runtime";

function canUseBrowserNotifications() {
  return typeof window !== "undefined" && "Notification" in window;
}

export const deviceNotifications: NotificationBridge = {
  async configure() {
    if (!canUseBrowserNotifications()) {
      return;
    }

    if (Notification.permission === "default") {
      await Notification.requestPermission().catch(() => "denied");
    }
  },
  async schedule(payload: NotificationBridgePayload) {
    if (!canUseBrowserNotifications() || Notification.permission !== "granted") {
      return;
    }

    const notification = new Notification(payload.title, {
      body: payload.body,
      tag: payload.data.roomId ?? undefined,
      silent: payload.data.kind !== "alert" && payload.data.kind !== "sos"
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  },
  addReceivedListener() {
    return {
      remove() {
        return undefined;
      }
    };
  },
  addResponseListener() {
    return {
      remove() {
        return undefined;
      }
    };
  }
};
