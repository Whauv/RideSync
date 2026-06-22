import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/primitives/AppText";
import { useTheme } from "@/design/ThemeProvider";

interface SegmentedOption<T extends string> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (next: T) => void;
}

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  const theme = useTheme();

  return (
    <View style={[styles.shell, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.lineSubtle }]}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.segment,
              {
                backgroundColor: active ? theme.colors.surfaceRaised : "transparent",
                borderColor: active ? theme.colors.lineSubtle : "transparent"
              }
            ]}
          >
            <AppText variant="callout" tone={active ? "primary" : "secondary"}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    minHeight: 50,
    borderRadius: 18,
    borderWidth: 1,
    padding: 4,
    flexDirection: "row",
    gap: 4
  },
  segment: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10
  }
});
