import { useColorScheme } from "react-native";

// Neutral demo tokens; these are not the private app's branding or palette.
const lightColors = {
  text: "#172033",
  muted: "#58647A",
  border: "#B4BECC",
  surface: "#FFFFFF",
  surfaceAlt: "#E8EDF5",
  primary: "#2456A6",
  primaryPressed: "#193E7B",
  primaryText: "#FFFFFF",
  secondary: "#F5F7FA",
  secondaryText: "#172033",
};

export type AppColors = typeof lightColors;

const darkColors: AppColors = {
  text: "#F1F5FA",
  muted: "#B5C0D1",
  border: "#65738A",
  surface: "#162033",
  surfaceAlt: "#25344D",
  primary: "#A9CAFF",
  primaryPressed: "#82AFE9",
  primaryText: "#10213D",
  secondary: "#202D44",
  secondaryText: "#F1F5FA",
};

export function useThemeColors(): AppColors {
  return useColorScheme() === "dark" ? darkColors : lightColors;
}

export const spacing = { md: 16 };
export const radii = { md: 8 };
export const typography = { body: 15 };
