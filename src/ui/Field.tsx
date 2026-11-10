/** Adapted portfolio excerpt; see docs/design-notes.md. */
import { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";
import {
  type AppColors,
  radii,
  spacing,
  typography,
  useThemeColors,
} from "./theme.js";

type Props = TextInputProps & {
  label: string;
};

export default function Field({ label, multiline, style, ...rest }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        multiline={multiline}
        style={[
          styles.input,
          focused && styles.inputFocused,
          multiline && styles.multiline,
          style,
        ]}
        {...rest}
        accessibilityLabel={rest.accessibilityLabel ?? label}
        onFocus={(event) => {
          setFocused(true);
          rest.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          rest.onBlur?.(event);
        }}
      />
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    label: {
      fontSize: 14,
      color: colors.text,
      fontWeight: "900",
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.md,
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: 13,
      color: colors.text,
      fontSize: typography.body,
      fontWeight: "600",
    },
    inputFocused: {
      borderColor: colors.primary,
      backgroundColor: colors.surface,
    },
    multiline: {
      minHeight: 100,
      textAlignVertical: "top",
    },
  });
