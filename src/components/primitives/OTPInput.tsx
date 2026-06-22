import { useRef } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { AppText } from "@/components/primitives/AppText";
import { useTheme } from "@/design/ThemeProvider";

interface OTPInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  digits?: number;
}

export function OTPInput({ label, value, onChangeText, digits = 6 }: OTPInputProps) {
  const theme = useTheme();
  const inputRef = useRef<TextInput>(null);
  const cells = Array.from({ length: digits }, (_, index) => value[index] ?? "");

  return (
    <View style={styles.wrap}>
      <AppText variant="footnote" tone="secondary">
        {label}
      </AppText>
      <Pressable onPress={() => inputRef.current?.focus()} style={styles.row}>
        {cells.map((char, index) => (
          <View
            key={`${index}-${char}`}
            style={[
              styles.cell,
              {
                backgroundColor: theme.colors.surface,
                borderColor: char ? theme.colors.accent : theme.colors.lineSubtle
              }
            ]}
          >
            <AppText variant="title2">{char || "•"}</AppText>
          </View>
        ))}
      </Pressable>
      <TextInput
        autoCapitalize="characters"
        autoCorrect={false}
        keyboardType="default"
        maxLength={digits}
        onChangeText={(next) => onChangeText(next.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
        ref={inputRef}
        style={styles.hiddenInput}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8
  },
  row: {
    flexDirection: "row",
    gap: 8
  },
  cell: {
    flex: 1,
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center"
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0
  }
});
