import { PropsWithChildren, createContext, useCallback, useContext, useMemo, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AppText } from "@/components/primitives/AppText";
import { useTheme } from "@/design/ThemeProvider";

type ToastTone = "default" | "success" | "warning" | "danger";

interface ToastConfig {
  title: string;
  message?: string;
  tone?: ToastTone;
}

interface ToastContextValue {
  showToast: (config: ToastConfig) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => undefined,
  hideToast: () => undefined
});

export function ToastProvider({ children }: PropsWithChildren) {
  const theme = useTheme();
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const [translateY] = useState(() => new Animated.Value(-120));

  const hideToast = useCallback(() => {
    Animated.timing(translateY, {
      toValue: -120,
      duration: theme.tokens.motion.standard,
      useNativeDriver: true
    }).start(() => setToast(null));
  }, [theme.tokens.motion.standard, translateY]);

  const showToast = useCallback(
    (config: ToastConfig) => {
      setToast(config);
      translateY.setValue(-120);
      Animated.timing(translateY, {
        toValue: 0,
        duration: theme.tokens.motion.standard,
        useNativeDriver: true
      }).start();
      setTimeout(hideToast, 2800);
    },
    [hideToast, theme.tokens.motion.standard, translateY]
  );

  const value = useMemo(() => ({ showToast, hideToast }), [showToast, hideToast]);
  const stateTone =
    toast?.tone === "success"
      ? theme.state.success
      : toast?.tone === "warning"
        ? theme.state.warning
        : toast?.tone === "danger"
          ? theme.state.danger
          : theme.state.neutral;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <SafeAreaView pointerEvents="box-none" style={styles.overlay}>
          <Animated.View style={[styles.toastWrap, { transform: [{ translateY }] }]}>
            <Pressable
              onPress={hideToast}
              style={[
                styles.toast,
                theme.elevation.medium,
                {
                  borderColor: stateTone.border
                }
              ]}
            >
              <BlurView intensity={theme.mode === "dark" ? 22 : 32} pointerEvents="none" style={StyleSheet.absoluteFill} tint={theme.mode} />
              <View style={[styles.iconWrap, { backgroundColor: stateTone.fill }]}>
                <MaterialCommunityIcons
                  color={stateTone.text}
                  name={toast.tone === "success" ? "check-bold" : toast.tone === "danger" ? "alert-octagon" : "bell-ring"}
                  size={18}
                />
              </View>
              <View style={styles.copy}>
                <AppText variant="bodyStrong">{toast.title}</AppText>
                {toast.message ? (
                  <AppText tone="secondary" variant="callout">
                    {toast.message}
                  </AppText>
                ) : null}
              </View>
            </Pressable>
          </Animated.View>
        </SafeAreaView>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center"
  },
  toastWrap: {
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 8
  },
  toast: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    gap: 12
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  copy: {
    flex: 1,
    gap: 2
  }
});
