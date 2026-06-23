import { PropsWithChildren, useEffect, useState } from "react";
import { Animated, Modal, Pressable, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";

import { useTheme } from "@/design/ThemeProvider";

interface BottomSheetProps extends PropsWithChildren {
  visible: boolean;
  onClose: () => void;
}

export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const theme = useTheme();
  const [translateY] = useState(() => new Animated.Value(320));
  const [scrimOpacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: visible ? 0 : 320,
        duration: theme.tokens.motion.standard,
        useNativeDriver: true
      }),
      Animated.timing(scrimOpacity, {
        toValue: visible ? 1 : 0,
        duration: theme.tokens.motion.standard,
        useNativeDriver: true
      })
    ]).start();
  }, [scrimOpacity, theme.tokens.motion.standard, translateY, visible]);

  return (
    <Modal animationType="none" onRequestClose={onClose} transparent visible={visible}>
      <Pressable onPress={onClose} style={styles.scrim}>
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.scrim, opacity: scrimOpacity }]}
        />
        <BlurView intensity={theme.mode === "dark" ? 18 : 28} pointerEvents="none" style={StyleSheet.absoluteFill} tint={theme.mode} />
        <Pressable>
          <Animated.View
            style={[
              styles.sheet,
              {
                backgroundColor: theme.colors.surfaceRaised,
                borderColor: theme.colors.lineSubtle,
                transform: [{ translateY }]
              }
            ]}
          >
            <View style={[styles.handle, { backgroundColor: theme.colors.lineStrong }]} />
            {children}
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    justifyContent: "flex-end"
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 18,
    paddingBottom: 30,
    gap: 14
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 999,
    alignSelf: "center",
    marginBottom: 6
  }
});
