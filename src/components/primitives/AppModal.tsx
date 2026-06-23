import { PropsWithChildren } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";

import { AppText } from "@/components/primitives/AppText";
import { useTheme } from "@/design/ThemeProvider";

interface AppModalProps extends PropsWithChildren {
  visible: boolean;
  onClose: () => void;
  title: string;
}

export function AppModal({ visible, onClose, title, children }: AppModalProps) {
  const theme = useTheme();

  return (
    <Modal onRequestClose={onClose} transparent visible={visible}>
      <Pressable onPress={onClose} style={styles.scrim}>
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.scrim }]} />
        <BlurView intensity={theme.mode === "dark" ? 16 : 24} pointerEvents="none" style={StyleSheet.absoluteFill} tint={theme.mode} />
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={[
            styles.modal,
            theme.elevation.high,
            { backgroundColor: theme.colors.surfaceRaised, borderColor: theme.colors.lineSubtle }
          ]}
        >
          <AppText variant="title2">{title}</AppText>
          <View style={styles.body}>{children}</View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  modal: {
    width: "100%",
    maxWidth: 540,
    borderRadius: 28,
    borderWidth: 1,
    padding: 20,
    gap: 14
  },
  body: {
    gap: 12
  }
});
