import { StyleSheet, TextInput, View } from "react-native";

import { AppText } from "@/components/core/AppText";
import { useTheme } from "@/design/ThemeProvider";

interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}

export function TextField({ label, value, onChangeText, placeholder }: TextFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <AppText tone="muted" style={styles.label}>
        {label}
      </AppText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSoft}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.line,
            color: theme.colors.text
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8
  },
  label: {
    fontWeight: "600"
  },
  input: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15
  }
});
