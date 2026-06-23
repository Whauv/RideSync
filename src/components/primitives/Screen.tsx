import { PropsWithChildren, useEffect, useState } from "react";
import { Animated, RefreshControl, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/design/ThemeProvider";

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  insetBottom?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function Screen({
  children,
  scroll = false,
  contentStyle,
  insetBottom = true,
  refreshing = false,
  onRefresh
}: ScreenProps) {
  const theme = useTheme();
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(10));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: theme.tokens.motion.standard,
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: theme.tokens.motion.standard,
        useNativeDriver: true
      })
    ]).start();
  }, [opacity, theme.tokens.motion.standard, translateY]);

  const body = (
    <Animated.View
      style={[
        styles.content,
        !insetBottom && styles.noBottomInset,
        contentStyle,
        { opacity, transform: [{ translateY }] }
      ]}
    >
      {children}
    </Animated.View>
  );

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={onRefresh ? <RefreshControl onRefresh={onRefresh} refreshing={refreshing} tintColor={theme.colors.accent} /> : undefined}
          showsVerticalScrollIndicator={false}
        >
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
