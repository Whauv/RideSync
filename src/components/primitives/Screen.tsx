import { PropsWithChildren } from "react";
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/design/ThemeProvider";

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  insetBottom?: boolean;
}

export function Screen({ children, scroll = false, contentStyle, insetBottom = true }: ScreenProps) {
  const theme = useTheme();
  const body = <View style={[styles.content, !insetBottom && styles.noBottomInset, contentStyle]}>{children}</View>;

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {body}
        </ScrollView>
      ) : (
        body
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  noBottomInset: {
    paddingBottom: 0
  }
});
