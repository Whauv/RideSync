import * as Notifications from "expo-notifications";

import { NotificationBridge, NotificationBridgePayload } from "@/types/runtime";

export const deviceNotifications: NotificationBridge = {
  async configure() {
    await Notifications.setNotificationChannelAsync("ridesync-urgent", {
      name: "RideSync urgent",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 120, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC
    });

    await Notifications.setNotificationChannelAsync("ridesync-status", {
      name: "RideSync status",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 120],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC
    });

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false
      })
    });
  },
  async schedule(payload: NotificationBridgePayload) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: payload.title,
        body: payload.body,
        sound: "default",
        priority: Notifications.AndroidNotificationPriority.MAX,
        categoryIdentifier: payload.data.kind === "alert" || payload.data.kind === "sos" ? "ridesync-urgent" : "ridesync-status",
        data: payload.data
      },
      trigger: null
    });
  },
  addReceivedListener(listener) {
    return Notifications.addNotificationReceivedListener(listener);
  },
  addResponseListener(listener) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }
};
