import { PropsWithChildren } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

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
      <Pressable onPress={onClose} style={[styles.scrim, { backgroundColor: theme.colors.scrim }]}>
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={[styles.modal, { backgroundColor: theme.colors.surfaceRaised, borderColor: theme.colors.lineSubtle }]}
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
    borderRadius: 26,
    borderWidth: 1,
    padding: 18,
    gap: 14
  },
  body: {
    gap: 12
  }
});
