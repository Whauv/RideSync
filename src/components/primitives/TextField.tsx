import { ReactNode } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AppText } from "@/components/primitives/AppText";
import { useTheme } from "@/design/ThemeProvider";

interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  leadingIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  trailing?: ReactNode;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  textContentType?:
    | "none"
    | "name"
    | "emailAddress"
    | "telephoneNumber"
    | "password"
    | "username"
    | "nickname";
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  helperText,
  errorText,
  leadingIcon,
  trailing,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "sentences",
  autoCorrect = false,
  textContentType
}: TextFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrap}>
      <AppText variant="footnote" tone="secondary">
        {label}
      </AppText>
      <View style={[styles.field, { backgroundColor: theme.colors.surface, borderColor: theme.colors.lineSubtle }]}>
        {leadingIcon ? <MaterialCommunityIcons color={theme.colors.textTertiary} name={leadingIcon} size={18} /> : null}
        <TextInput
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textTertiary}
          secureTextEntry={secureTextEntry}
          style={[styles.input, { color: theme.colors.textPrimary }]}
          textContentType={textContentType}
          value={value}
        />
        {trailing ? <Pressable>{trailing}</Pressable> : null}
      </View>
      {errorText ? (
        <AppText style={{ color: theme.colors.danger }} variant="footnote">
          {errorText}
        </AppText>
      ) : helperText ? (
        <AppText variant="footnote" tone="tertiary">
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8
  },
  field: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 14
  }
});
