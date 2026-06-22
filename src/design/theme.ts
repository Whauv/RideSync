import { AppThemeMode, tokens } from "@/design/tokens";

export interface AppTheme {
  mode: AppThemeMode;
  colors: {
    bg: string;
    bgElevated: string;
    bgOverlay: string;
    surface: string;
    surfaceMuted: string;
    surfaceStrong: string;
    text: string;
    textMuted: string;
    textSoft: string;
    line: string;
    accent: string;
    accentSoft: string;
    success: string;
    warning: string;
    danger: string;
    mapRoad: string;
    mapTerrain: string;
    white: string;
    black: string;
  };
  shadow: {
    card: {
      shadowColor: string;
      shadowOpacity: number;
      shadowRadius: number;
      shadowOffset: { width: number; height: number };
      elevation: number;
    };
  };
  tokens: typeof tokens;
}

const baseShadow = {
  shadowColor: "#000000",
  shadowOpacity: 0.18,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 8 },
  elevation: 8
};

export const lightTheme: AppTheme = {
  mode: "light",
  colors: {
    bg: "#F4F3EF",
    bgElevated: "#FFFFFF",
    bgOverlay: "rgba(248, 247, 242, 0.78)",
    surface: "#FFFCF7",
    surfaceMuted: "#F0ECE4",
    surfaceStrong: "#E7E1D6",
    text: "#111317",
    textMuted: "#4B515B",
    textSoft: "#6A707A",
    line: "#D6D1C7",
    accent: "#0F766E",
    accentSoft: "#D7ECE8",
    success: "#237B57",
    warning: "#A86B1E",
    danger: "#A03131",
    mapRoad: "#DAD7D1",
    mapTerrain: "#EBE6DC",
    white: "#FFFFFF",
    black: "#000000"
  },
  shadow: { card: baseShadow },
  tokens
};

export const darkTheme: AppTheme = {
  mode: "dark",
  colors: {
    bg: "#0C0D10",
    bgElevated: "#14161B",
    bgOverlay: "rgba(14, 16, 20, 0.84)",
    surface: "#161A20",
    surfaceMuted: "#1C2027",
    surfaceStrong: "#242A33",
    text: "#F4F5F7",
    textMuted: "#C5CAD3",
    textSoft: "#8A92A0",
    line: "#2A303B",
    accent: "#5FD0C0",
    accentSoft: "#193A38",
    success: "#49C387",
    warning: "#E6B15A",
    danger: "#F26F6F",
    mapRoad: "#2A3036",
    mapTerrain: "#171C22",
    white: "#FFFFFF",
    black: "#000000"
  },
  shadow: {
    card: {
      ...baseShadow,
      shadowOpacity: 0.34
    }
  },
  tokens
};
