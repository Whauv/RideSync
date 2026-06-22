import { PropsWithChildren, useEffect, useState } from "react";
import { Animated, Modal, Pressable, StyleSheet, View } from "react-native";

import { useTheme } from "@/design/ThemeProvider";

interface BottomSheetProps extends PropsWithChildren {
  visible: boolean;
  onClose: () => void;
}

export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const theme = useTheme();
  const [translateY] = useState(() => new Animated.Value(320));

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : 320,
      duration: theme.tokens.motion.standard,
      useNativeDriver: true
    }).start();
  }, [translateY, theme.tokens.motion.standard, visible]);

  return (
    <Modal animationType="none" onRequestClose={onClose} transparent visible={visible}>
      <Pressable onPress={onClose} style={[styles.scrim, { backgroundColor: theme.colors.scrim }]}>
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
    padding: 16,
    paddingBottom: 28,
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
