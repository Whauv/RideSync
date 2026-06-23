import { NotificationBridge } from "@/types/runtime";

export const deviceNotifications: NotificationBridge = {
  async configure() {
    return undefined;
  },
  async schedule() {
    return undefined;
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
