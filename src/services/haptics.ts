import * as Haptics from "expo-haptics";

export async function hapticSelection() {
  await Haptics.selectionAsync().catch(() => undefined);
}

export async function hapticSoftImpact() {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => undefined);
}

export async function hapticMediumImpact() {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
}

export async function hapticSuccess() {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}

export async function hapticWarning() {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
}

export async function hapticError() {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
}
