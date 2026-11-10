/** Adapted portfolio excerpt; see docs/design-notes.md. */
import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { type AppColors, radii, spacing, useThemeColors } from "./theme.js";

type Props = {
  label: string;
  onPress: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  style?: StyleProp<ViewStyle>;
};

export default function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  style,
}: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isDisabled = disabled || loading;
  const primary = variant === "primary";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        primary ? styles.primary : styles.secondary,
        pressed &&
          !isDisabled &&
          (primary ? styles.primaryPressed : styles.secondaryPressed),
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={primary ? colors.primaryText : colors.text} />
      ) : (
        <Text
          style={[
            styles.label,
            primary ? styles.primaryLabel : styles.secondaryLabel,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    base: {
      minHeight: 54,
      borderRadius: radii.md,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.md,
      borderWidth: 1,
    },
    primary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    primaryPressed: {
      backgroundColor: colors.primaryPressed,
      borderColor: colors.primaryPressed,
    },
    secondary: {
      backgroundColor: colors.secondary,
      borderColor: colors.border,
    },
    secondaryPressed: {
      backgroundColor: colors.surfaceAlt,
    },
    disabled: {
      opacity: 0.6,
    },
    label: {
      fontSize: 15,
      fontWeight: "900",
      letterSpacing: 0,
    },
    primaryLabel: {
      color: colors.primaryText,
    },
    secondaryLabel: {
      color: colors.secondaryText,
    },
  });
