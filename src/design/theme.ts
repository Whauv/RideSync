import { Theme as NavigationTheme } from "@react-navigation/native";

import { tokens } from "@/design/tokens";

type StateTone = {
  fill: string;
  text: string;
  border: string;
};

type ElevationStyle = {
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffset: { width: number; height: number };
  elevation: number;
};

export interface AppTheme {
  mode: "light" | "dark";
  tokens: typeof tokens;
  colors: {
    background: string;
    backgroundAlt: string;
    canvas: string;
    surface: string;
    surfaceMuted: string;
    surfaceRaised: string;
    surfaceOverlay: string;
    surfaceInverse: string;
    scrim: string;
    lineSubtle: string;
    lineStrong: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    textInverse: string;
    accent: string;
    accentPressed: string;
    accentMuted: string;
    focusRing: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    successMuted: string;
    warningMuted: string;
    dangerMuted: string;
    infoMuted: string;
    mapBase: string;
    mapRoad: string;
    mapWater: string;
    mapRoute: string;
    mapRider: string;
    mapLeader: string;
    white: string;
    black: string;
  };
  state: {
    success: StateTone;
    warning: StateTone;
    danger: StateTone;
    info: StateTone;
    neutral: StateTone;
  };
  elevation: {
    none: ElevationStyle;
    low: ElevationStyle;
    medium: ElevationStyle;
    high: ElevationStyle;
  };
}

const lightTheme: AppTheme = {
  mode: "light",
  tokens,
  colors: {
    background: "#F4F2EC",
    backgroundAlt: "#ECE8DE",
    canvas: "#FBFAF7",
    surface: "#FFFEFA",
    surfaceMuted: "#F3F0E8",
    surfaceRaised: "#FFFFFF",
    surfaceOverlay: "rgba(255, 255, 252, 0.86)",
    surfaceInverse: "#15171B",
    scrim: "rgba(9, 10, 12, 0.22)",
    lineSubtle: "rgba(75, 69, 60, 0.12)",
    lineStrong: "rgba(46, 43, 38, 0.22)",
    textPrimary: "#141619",
    textSecondary: "#4F554E",
    textTertiary: "#7B827C",
    textInverse: "#FCFCFA",
    accent: "#0F7D74",
    accentPressed: "#0C625B",
    accentMuted: "#D9F0EB",
    focusRing: "rgba(15, 125, 116, 0.34)",
    success: "#2D9D64",
    warning: "#B98327",
    danger: "#C25454",
    info: "#4E87D8",
    successMuted: "#DDF7E9",
    warningMuted: "#F8EBCB",
    dangerMuted: "#F8D9D8",
    infoMuted: "#D9E8FB",
    mapBase: "#E8E2D7",
    mapRoad: "#CDC6B8",
    mapWater: "#D7E7EC",
    mapRoute: "#1D8F86",
    mapRider: "#2E2B26",
    mapLeader: "#0F7D74",
    white: "#FFFFFF",
    black: "#000000"
  },
  state: {
    success: { fill: "#DDF7E9", text: "#23784D", border: "rgba(45, 157, 100, 0.24)" },
    warning: { fill: "#F8EBCB", text: "#8A631B", border: "rgba(185, 131, 39, 0.24)" },
    danger: { fill: "#F8D9D8", text: "#933636", border: "rgba(194, 84, 84, 0.24)" },
    info: { fill: "#D9E8FB", text: "#335F9A", border: "rgba(78, 135, 216, 0.24)" },
    neutral: { fill: "#F3F0E8", text: "#4F554E", border: "rgba(75, 69, 60, 0.14)" }
  },
  elevation: tokens.elevation
};

const darkTheme: AppTheme = {
  mode: "dark",
  tokens,
  colors: {
    background: "#0B0C0E",
    backgroundAlt: "#111316",
    canvas: "#13161A",
    surface: "#171A1F",
    surfaceMuted: "#1D2128",
    surfaceRaised: "#20252D",
    surfaceOverlay: "rgba(19, 22, 26, 0.86)",
    surfaceInverse: "#F5F4F0",
    scrim: "rgba(0, 0, 0, 0.42)",
    lineSubtle: "rgba(255, 255, 255, 0.08)",
    lineStrong: "rgba(255, 255, 255, 0.16)",
    textPrimary: "#F5F4F0",
    textSecondary: "#CACFC8",
    textTertiary: "#8D938E",
    textInverse: "#111316",
    accent: "#4EC3B5",
    accentPressed: "#78D7C7",
    accentMuted: "#163A37",
    focusRing: "rgba(78, 195, 181, 0.34)",
    success: "#49B874",
    warning: "#D2A24B",
    danger: "#E17A7A",
    info: "#7AA7E6",
    successMuted: "#14271D",
    warningMuted: "#2B2414",
    dangerMuted: "#2D1919",
    infoMuted: "#172436",
    mapBase: "#1A1F25",
    mapRoad: "#31373F",
    mapWater: "#1A2A33",
    mapRoute: "#4EC3B5",
    mapRider: "#F5F4F0",
    mapLeader: "#4EC3B5",
    white: "#FFFFFF",
    black: "#000000"
  },
  state: {
    success: { fill: "#14271D", text: "#74D49B", border: "rgba(73, 184, 116, 0.26)" },
    warning: { fill: "#2B2414", text: "#E6C06B", border: "rgba(210, 162, 75, 0.24)" },
    danger: { fill: "#2D1919", text: "#F09A9A", border: "rgba(225, 122, 122, 0.22)" },
    info: { fill: "#172436", text: "#9CC0F0", border: "rgba(122, 167, 230, 0.24)" },
    neutral: { fill: "#1D2128", text: "#CACFC8", border: "rgba(255, 255, 255, 0.08)" }
  },
  elevation: {
    ...tokens.elevation,
    low: { ...tokens.elevation.low, shadowOpacity: 0.16 },
    medium: { ...tokens.elevation.medium, shadowOpacity: 0.22 },
    high: { ...tokens.elevation.high, shadowOpacity: 0.28 }
  }
};

export function getAppTheme(mode: "light" | "dark") {
  return mode === "light" ? lightTheme : darkTheme;
}

export function createNavigationTheme(theme: AppTheme): NavigationTheme {
  return {
    dark: theme.mode === "dark",
    colors: {
      primary: theme.colors.accent,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.textPrimary,
      border: theme.colors.lineSubtle,
      notification: theme.colors.danger
    }
  };
}
